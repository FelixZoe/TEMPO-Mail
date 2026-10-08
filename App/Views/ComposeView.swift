import SwiftUI

struct ComposeView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ComposeDraft()
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                VStack(spacing: 0) {
                    TextField("收件人", text: $draft.to)
                        .textContentType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    Divider().padding(.leading, 16)
                    TextField("主题", text: $draft.subject)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    Divider().padding(.leading, 16)
                }
                TextEditor(text: $draft.body)
                    .padding(12)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .navigationTitle("新邮件")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                        .buttonStyle(.glass)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(action: send) {
                        if model.mail.isSending {
                            ProgressView()
                        } else {
                            Label("发送", systemImage: "paperplane.fill")
                        }
                    }
                    .buttonStyle(.glassProminent)
                    .disabled(!canSend || model.mail.isSending)
                }
            }
            .alert("发送失败", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("好", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "未知错误")
            }
        }
        .interactiveDismissDisabled(model.mail.isSending)
    }

    private var canSend: Bool {
        !draft.to.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        (!draft.subject.isEmpty || !draft.body.isEmpty)
    }

    private func send() {
        guard let account = model.accounts.selectedAccount else { return }
        Task {
            do {
                let password = try model.password(for: account)
                try await model.mail.send(draft, account: account, password: password)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
