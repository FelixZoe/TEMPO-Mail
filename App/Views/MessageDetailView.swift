import SwiftUI

struct MessageDetailView: View {
    @Environment(AppModel.self) private var model
    let message: MailMessage

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text(message.subject.isEmpty ? "（无主题）" : message.subject)
                    .font(.title2.bold())
                VStack(alignment: .leading, spacing: 6) {
                    Label(message.senderLabel, systemImage: "person.crop.circle")
                        .font(.headline)
                    if !message.senderAddress.isEmpty {
                        Text(message.senderAddress)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Text(message.receivedAt, format: .dateTime.year().month().day().hour().minute())
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                Divider()
                Text(message.plainTextBody)
                    .font(.body)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(20)
        }
        .navigationTitle("邮件")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            guard let account = model.accounts.selectedAccount,
                  let password = try? model.password(for: account) else { return }
            await model.mail.markRead(message, account: account, password: password)
        }
    }
}
