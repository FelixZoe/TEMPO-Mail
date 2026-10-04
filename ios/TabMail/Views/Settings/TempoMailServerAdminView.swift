/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import SwiftUI
import WebKit

/// TEMPO Mail 的服务器管理入口。
///
/// 用户、域名、队列、日志以及账户停用/恢复继续由 Stalwart 自己的权限模型
/// 负责；客户端不保存管理员密码，也不会绕过邮箱账户授权读取任意邮件。
struct TempoMailServerAdminView: View {
    private let adminURL = URL(string: "https://mail.darker.one/admin")!

    var body: some View {
        TempoMailAdminWebView(url: adminURL)
            .navigationTitle("服务器管理")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Link(destination: adminURL) {
                        Image(systemName: "safari")
                    }
                    .accessibilityLabel("在浏览器中打开")
                }
            }
    }
}

private struct TempoMailAdminWebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.allowsBackForwardNavigationGestures = true
        view.customUserAgent = "TEMPO-Mail-iOS/0.1"
        var request = URLRequest(url: url)
        request.setValue("zh-CN,zh;q=0.9", forHTTPHeaderField: "Accept-Language")
        view.load(request)
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
