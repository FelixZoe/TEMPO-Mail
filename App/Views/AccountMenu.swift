import SwiftUI

struct AccountMenu: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        Menu {
            ForEach(model.accounts.accounts) { account in
                Button {
                    model.select(account)
                } label: {
                    Label {
                        VStack(alignment: .leading) {
                            Text(account.displayName)
                            Text(account.emailAddress)
                        }
                    } icon: {
                        Image(systemName: account.id == model.accounts.selectedAccountID ? "checkmark.circle.fill" : "person.crop.circle")
                    }
                }
            }
            Divider()
            Button {
                model.isPresentingAccountSetup = true
            } label: {
                Label("添加账户", systemImage: "person.crop.circle.badge.plus")
            }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: "person.crop.circle")
                    .font(.title3)
                VStack(alignment: .leading, spacing: 1) {
                    Text(model.accounts.selectedAccount?.displayName ?? "账户")
                        .font(.headline)
                    Text(model.accounts.selectedAccount?.emailAddress ?? "")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                Image(systemName: "chevron.down")
                    .font(.caption2.weight(.semibold))
            }
        }
        .buttonStyle(.glass)
        .accessibilityLabel("切换邮件账户")
    }
}
