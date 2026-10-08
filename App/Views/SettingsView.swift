import SwiftUI

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @State private var pendingRemoval: MailAccount?
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            List {
                Section("账户") {
                    ForEach(model.accounts.accounts) { account in
                        Button {
                            model.select(account)
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(account.displayName)
                                    Text(account.emailAddress)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                if account.id == model.accounts.selectedAccountID {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundStyle(.primary)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                        .swipeActions {
                            Button("删除", role: .destructive) { pendingRemoval = account }
                        }
                    }
                    Button {
                        model.isPresentingAccountSetup = true
                    } label: {
                        Label("添加账户", systemImage: "plus")
                    }
                    .buttonStyle(.glass)
                }

                Section("服务") {
                    LabeledContent("协议", value: "JMAP")
                    LabeledContent("服务地址", value: model.accounts.selectedAccount?.sessionURL.host ?? "—")
                    LabeledContent("凭据", value: "Keychain")
                }

                Section("OTA 配置") {
                    LabeledContent("状态", value: otaStatus)
                    LabeledContent("每页邮件", value: "\(model.ota.configuration.normalizedPageSize)")
                    LabeledContent("刷新周期", value: "\(model.ota.configuration.normalizedRefreshInterval) 秒")
                    if let error = model.ota.errorMessage {
                        Text(error).font(.caption).foregroundStyle(.red)
                    }
                    Button("立即检查配置") {
                        guard let account = model.accounts.selectedAccount else { return }
                        Task { await model.ota.refresh(for: account) }
                    }
                    .buttonStyle(.glass)
                }

                Section {
                    Text("TEMPO Mail 0.1.0")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("设置")
            .confirmationDialog(
                "删除这个账户？",
                isPresented: Binding(
                    get: { pendingRemoval != nil },
                    set: { if !$0 { pendingRemoval = nil } }
                ),
                titleVisibility: .visible,
                presenting: pendingRemoval
            ) { account in
                Button("删除 \(account.emailAddress)", role: .destructive) { remove(account) }
            } message: { _ in
                Text("本机保存的账户和密码会被移除，服务器邮件不会删除。")
            }
            .alert("无法删除账户", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("好", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "未知错误")
            }
        }
    }

    private var otaStatus: String {
        guard model.accounts.selectedAccount?.remoteConfigURL != nil else { return "未配置" }
        return model.ota.errorMessage == nil ? "签名已验证" : "使用本地配置"
    }

    private func remove(_ account: MailAccount) {
        do {
            model.ota.removeCache(for: account)
            try model.accounts.remove(account)
            model.mail.clear()
            pendingRemoval = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
