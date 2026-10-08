import SwiftUI

struct SetupView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    let allowsCancellation: Bool

    @State private var draft = ServerSetupDraft()
    @State private var isConnecting = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Image(systemName: "envelope.open.fill")
                            .font(.system(size: 36, weight: .semibold))
                        Text("连接你的邮件服务")
                            .font(.title2.bold())
                        Text("TEMPO Mail 不预设服务。验证通过后才能进入邮箱。")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 8)
                }

                Section("账户") {
                    TextField("显示名称", text: $draft.displayName)
                        .textContentType(.name)
                    TextField("邮箱地址", text: $draft.emailAddress)
                        .textContentType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                    TextField("登录用户名", text: $draft.username)
                        .textContentType(.username)
                        .textInputAutocapitalization(.never)
                    SecureField("密码", text: $draft.password)
                        .textContentType(.password)
                }

                Section("JMAP 服务") {
                    TextField("https://mail.example.com/.well-known/jmap", text: $draft.sessionEndpoint)
                        .textContentType(.URL)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.URL)
                    Text("使用 Stalwart 时填写 JMAP Session URL。正式环境只允许 HTTPS。")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("签名 OTA 配置（可选）") {
                    TextField("配置包 URL", text: $draft.remoteConfigEndpoint)
                        .textContentType(.URL)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.URL)
                    TextField("P-256 X9.63 公钥（Base64）", text: $draft.remoteConfigPublicKey, axis: .vertical)
                        .textInputAutocapitalization(.never)
                        .font(.caption.monospaced())
                    Text("OTA 只更新公告、支持链接、刷新周期等数据，不执行远程代码。")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                if let errorMessage {
                    Section {
                        Label(errorMessage, systemImage: "exclamationmark.triangle.fill")
                            .foregroundStyle(.red)
                    }
                }

                Section {
                    Button(action: connect) {
                        HStack {
                            Spacer()
                            if isConnecting {
                                ProgressView()
                            } else {
                                Label("验证并进入邮箱", systemImage: "arrow.right")
                            }
                            Spacer()
                        }
                    }
                    .buttonStyle(.glassProminent)
                    .disabled(!canConnect || isConnecting)
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle("配置服务")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if allowsCancellation {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("取消") { dismiss() }
                            .buttonStyle(.glass)
                    }
                }
            }
        }
        .interactiveDismissDisabled(isConnecting)
    }

    private var canConnect: Bool {
        !draft.emailAddress.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !draft.sessionEndpoint.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !draft.username.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !draft.password.isEmpty
    }

    private func connect() {
        isConnecting = true
        errorMessage = nil
        Task {
            defer { isConnecting = false }
            do {
                let result = try await AccountSetupService().connect(draft)
                try model.accounts.add(result.account, password: result.password)
                model.select(result.account)
                model.isPresentingAccountSetup = false
                if allowsCancellation { dismiss() }
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
