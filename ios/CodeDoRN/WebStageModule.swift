import Foundation
import UIKit
import WebKit
import React

// Keep the React Native module name identical to Android. All JS launch paths
// intentionally call NativeModules.WebStage.
@objc(WebStage)
final class WebStageModule: NSObject, WKScriptMessageHandler {
  private weak var presenter: UIViewController?
  private var pending: RCTPromiseResolveBlock?

  @objc static func requiresMainQueueSetup() -> Bool { true }

  @objc(copyToClipboard:resolver:rejecter:)
  func copyToClipboard(_ value: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    UIPasteboard.general.string = value
    resolver(true)
  }

  @objc(warmUp)
  func warmUp() {}

  @objc(open:stage:dark:practice:tryIt:prefillCode:practiceHelpLevel:resolver:rejecter:)
  func open(_ lessonKey: String, stage: String, dark: Bool, practice: Bool, tryIt: Bool, prefillCode: String?, practiceHelpLevel: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard let host = RCTPresentedViewController() else {
        rejecter("no_view_controller", "No view controller is available to open the editor.", nil)
        return
      }
      let vc = WebStageViewController(lessonKey: lessonKey, stage: stage, dark: dark, practice: practice, tryIt: tryIt, prefillCode: prefillCode, practiceHelpLevel: practiceHelpLevel) { [weak self] action in
        self?.pending?(action)
        self?.pending = nil
      }
      // The editor is a destination screen, not a sheet. `automatic` can
      // choose a page-sheet presentation and make it appear as a dialog.
      vc.modalPresentationStyle = .fullScreen
      vc.modalPresentationCapturesStatusBarAppearance = true
      self.pending = resolver
      self.presenter = vc
      host.present(vc, animated: true)
    }
  }

  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    guard message.name == "NativeScreens", let body = message.body as? [String: Any], body["method"] as? String == "closeStage" else { return }
    let action = body["action"] as? String ?? "back"
    presenter?.dismiss(animated: true)
    pending?(action)
    pending = nil
  }
}

@objc private final class WebStageViewController: UIViewController {
  private let webView: WKWebView
  private let onClose: (String) -> Void
  private let dark: Bool

  init(lessonKey: String, stage: String, dark: Bool, practice: Bool, tryIt: Bool, prefillCode: String?, practiceHelpLevel: String?, onClose: @escaping (String) -> Void) {
    self.dark = dark
    self.onClose = onClose
    let content = WKUserContentController()
    var launchPayload: [String: Any] = [
      "lessonKey": lessonKey,
      "stage": stage,
      "dark": dark,
      "practice": practice,
      "tryIt": tryIt,
    ]
    if let prefillCode {
      launchPayload["prefillCode"] = prefillCode
    }
    if let practiceHelpLevel {
      launchPayload["practiceHelpLevel"] = practiceHelpLevel
    }
    if let payloadData = try? JSONSerialization.data(withJSONObject: launchPayload),
       let payloadJSON = String(data: payloadData, encoding: .utf8) {
      // Inject the complete launch request before the app executes. Code can
      // contain +, &, # and newlines, so URL query transport is not reliable.
      content.addUserScript(WKUserScript(
        source: "window.__CODEDO_STAGE_LAUNCH__ = \(payloadJSON);",
        injectionTime: .atDocumentStart,
        forMainFrameOnly: true
      ))
    }
    let config = WKWebViewConfiguration()
    config.userContentController = content
    config.setURLSchemeHandler(WebStageSchemeHandler(), forURLScheme: "codedo")
    self.webView = WKWebView(frame: .zero, configuration: config)
    super.init(nibName: nil, bundle: nil)
    let stageBackground = dark ? UIColor(red: 0.05, green: 0.06, blue: 0.10, alpha: 1) : UIColor.systemBackground
    // WKWebView otherwise starts as an opaque white view while the bundled
    // JavaScript and CSS load, which flashes in dark mode.
    webView.isOpaque = false
    webView.backgroundColor = stageBackground
    webView.scrollView.backgroundColor = stageBackground
    view.backgroundColor = stageBackground
    content.add(StageMessageHandler { [weak self] action in self?.dismiss(animated: true); self?.onClose(action) }, name: "NativeScreens")
    var components = URLComponents()
    components.queryItems = [
      URLQueryItem(name: "stageLessonKey", value: lessonKey), URLQueryItem(name: "stage", value: stage),
      URLQueryItem(name: "dark", value: String(dark)), URLQueryItem(name: "practice", value: String(practice)),
      URLQueryItem(name: "tryIt", value: String(tryIt)),
      URLQueryItem(name: "prefillCodeBase64", value: prefillCode?.data(using: .utf8)?.base64EncodedString()),
      URLQueryItem(name: "practiceHelpLevel", value: practiceHelpLevel),
    ]
    components.scheme = "codedo"
    components.host = "app"
    components.path = "/index.html"
    if let url = components.url {
      webView.load(URLRequest(url: url))
    }
  }

  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
  override func viewDidLoad() { super.viewDidLoad(); view.addSubview(webView); webView.translatesAutoresizingMaskIntoConstraints = false; NSLayoutConstraint.activate([webView.topAnchor.constraint(equalTo: view.topAnchor), webView.bottomAnchor.constraint(equalTo: view.bottomAnchor), webView.leadingAnchor.constraint(equalTo: view.leadingAnchor), webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)]) }
  override var prefersStatusBarHidden: Bool { false }
  override var preferredStatusBarStyle: UIStatusBarStyle { dark ? .lightContent : .darkContent }
}

/// Serves the bundled editor through one non-file origin. WKWebView applies
/// browser module/CORS restrictions to file:// pages, which can leave a Vite
/// module app completely white even though index.html itself loaded.
private final class WebStageSchemeHandler: NSObject, WKURLSchemeHandler {
  func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
    guard let url = urlSchemeTask.request.url else {
      fail(urlSchemeTask, "The editor requested an invalid URL.")
      return
    }

    let relativePath = url.path.removingPercentEncoding?.trimmingCharacters(in: CharacterSet(charactersIn: "/")) ?? ""
    guard !relativePath.isEmpty, !relativePath.split(separator: "/").contains("..") else {
      fail(urlSchemeTask, "The editor requested an invalid asset path.")
      return
    }

    let root = Bundle.main.bundleURL.appendingPathComponent("WebStageAssets", isDirectory: true)
    let file = root.appendingPathComponent(relativePath)
    guard FileManager.default.fileExists(atPath: file.path) else {
      fail(urlSchemeTask, "Editor asset not found: \(relativePath)")
      return
    }

    do {
      let data = try Data(contentsOf: file)
      let response = URLResponse(
        url: url,
        mimeType: mimeType(for: file.pathExtension),
        expectedContentLength: data.count,
        textEncodingName: isText(file.pathExtension) ? "utf-8" : nil
      )
      urlSchemeTask.didReceive(response)
      urlSchemeTask.didReceive(data)
      urlSchemeTask.didFinish()
    } catch {
      urlSchemeTask.didFailWithError(error)
    }
  }

  func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

  private func fail(_ task: WKURLSchemeTask, _ message: String) {
    task.didFailWithError(NSError(domain: "WebStage", code: 404, userInfo: [NSLocalizedDescriptionKey: message]))
  }

  private func isText(_ ext: String) -> Bool {
    ["html", "js", "css", "json", "map", "txt"].contains(ext.lowercased())
  }

  private func mimeType(for ext: String) -> String {
    switch ext.lowercased() {
    case "html": return "text/html"
    case "js", "mjs": return "text/javascript"
    case "css": return "text/css"
    case "json", "map": return "application/json"
    case "wasm": return "application/wasm"
    case "svg": return "image/svg+xml"
    case "png": return "image/png"
    case "jpg", "jpeg": return "image/jpeg"
    case "webp": return "image/webp"
    case "woff": return "font/woff"
    case "woff2": return "font/woff2"
    default: return "application/octet-stream"
    }
  }
}

private final class StageMessageHandler: NSObject, WKScriptMessageHandler {
  let onMessage: (String) -> Void
  init(_ onMessage: @escaping (String) -> Void) { self.onMessage = onMessage }
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    guard let body = message.body as? [String: Any], body["method"] as? String == "closeStage" else { return }
    onMessage(body["action"] as? String ?? "back")
  }
}
