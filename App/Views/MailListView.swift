import SwiftUI

struct MailListView: View {
    @Environment(AppModel.self) private var model
    let scope: MailScope
    @Binding var isComposing: Bool
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            Group {
                if messages.isEmpty && !model.mail.isLoading {
                    ContentUnavailableView(
                        searchText.isEmpty ? "没有邮件" : "没有搜索结果",
                        systemImage: searchText.isEmpty ? scope.systemImage : "magnifyingglass",
                        description: Text(model.mail.errorMessage ?? emptyDescription)
                    )
                } else {
                    List {
                        if let announcement = model.ota.configuration.announcement, !announcement.isEmpty {
                            Section {
                                Label(announcement, systemImage: "megaphone")
                                    .font(.subheadline)
                            }
                        }
                        Section {
                            ForEach(messages) { message in
                                NavigationLink(value: message) {
                                    MailRow(message: message)
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                    .refreshable { await load() }
                    .navigationDestination(for: MailMessage.self) { message in
                        MessageDetailView(message: message)
                    }
                }
            }
            .overlay {
                if model.mail.isLoading && messages.isEmpty {
                    ProgressView("正在同步")
                }
            }
            .navigationTitle(scope.title)
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "搜索发件人、主题或正文")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { AccountMenu() }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isComposing = true
                    } label: {
                        Image(systemName: "square.and.pencil")
                    }
                    .buttonStyle(.glassProminent)
                    .accessibilityLabel("写邮件")
                }
            }
        }
        .task(id: loadKey) {
            if !searchText.isEmpty {
                try? await Task.sleep(for: .milliseconds(350))
                guard !Task.isCancelled else { return }
            }
            await load()
        }
    }

    private var loadKey: String {
        "\(model.accounts.selectedAccountID?.uuidString ?? "none")|\(scope.rawValue)|\(searchText)|\(model.refreshGeneration)"
    }

    private var messages: [MailMessage] {
        model.mail.messages(for: scope)
    }

    private var emptyDescription: String {
        switch scope {
        case .inbox: "新邮件会显示在这里。"
        case .starred: "加星邮件会显示在这里。"
        case .sent: "已发送邮件会显示在这里。"
        }
    }

    private func load() async {
        guard let account = model.accounts.selectedAccount else { return }
        do {
            let password = try model.password(for: account)
            await model.mail.load(
                account: account,
                password: password,
                scope: scope,
                searchText: searchText,
                limit: model.ota.configuration.normalizedPageSize
            )
        } catch {
            model.mail.errorMessage = error.localizedDescription
        }
    }
}

private struct MailRow: View {
    let message: MailMessage

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(alignment: .firstTextBaseline) {
                Text(message.senderLabel)
                    .font(message.isUnread ? .headline : .body)
                    .lineLimit(1)
                Spacer(minLength: 8)
                Text(message.receivedAt, format: .dateTime.month().day().hour().minute())
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            HStack(spacing: 6) {
                if message.isStarred { Image(systemName: "star.fill").foregroundStyle(.yellow) }
                Text(message.subject.isEmpty ? "（无主题）" : message.subject)
                    .font(message.isUnread ? .subheadline.weight(.semibold) : .subheadline)
                    .lineLimit(1)
                if message.hasAttachment { Image(systemName: "paperclip") }
            }
            Text(message.preview)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 5)
    }
}
