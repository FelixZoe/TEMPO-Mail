import SwiftUI

struct AdministrationView: View {
    private enum ManagementArea: String, CaseIterable, Identifiable {
        case accounts = "账户"
        case temporary = "临时邮箱"
        var id: Self { self }
    }

    @Environment(AppModel.self) private var model
    @State private var section: ManagementArea = .accounts
    @State private var searchText = ""
    @State private var isPresentingCreation = false
    @State private var accountPendingDeletion: ManagedAccount?
    @State private var addressPendingDeletion: TemporaryAddress?

    var body: some View {
        NavigationStack {
            Group {
                if section == .accounts {
                    accountList
                } else {
                    temporaryAddressList
                }
            }
            .navigationTitle("管理")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { AccountMenu() }
                ToolbarItem(placement: .topBarTrailing) {
                    if canCreate {
                        Button { isPresentingCreation = true } label: {
                            Image(systemName: "plus")
                        }
                        .buttonStyle(.glass)
                        .accessibilityLabel(section == .accounts ? "添加账户" : "添加临时邮箱")
                    }
                }
            }
            .safeAreaInset(edge: .top) {
                Picker("管理内容", selection: $section) {
                    ForEach(ManagementArea.allCases) { item in Text(item.rawValue).tag(item) }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.bottom, 8)
                .background(.bar)
            }
            .searchable(text: $searchText, prompt: section == .accounts ? "搜索账户" : "搜索临时邮箱")
            .refreshable { await refresh() }
            .overlay {
                if model.administration.isLoading && model.administration.accounts.isEmpty {
                    ProgressView("正在读取服务器")
                }
            }
            .sheet(isPresented: $isPresentingCreation) {
                if section == .accounts {
                    CreateManagedAccountView()
                } else {
                    CreateTemporaryAddressView()
                }
            }
            .confirmationDialog(
                "删除服务器账户？",
                isPresented: Binding(
                    get: { accountPendingDeletion != nil },
                    set: { if !$0 { accountPendingDeletion = nil } }
                ),
                titleVisibility: .visible,
                presenting: accountPendingDeletion
            ) { account in
                Button("永久删除 \(account.emailAddress)", role: .destructive) {
                    Task { await delete(account) }
                }
            } message: { _ in
                Text("该账户及其服务器数据将被永久删除，此操作不可撤销。")
            }
            .confirmationDialog(
                "删除临时邮箱？",
                isPresented: Binding(
                    get: { addressPendingDeletion != nil },
                    set: { if !$0 { addressPendingDeletion = nil } }
                ),
                titleVisibility: .visible,
                presenting: addressPendingDeletion
            ) { address in
                Button("删除 \(address.email)", role: .destructive) {
                    Task { await delete(address) }
                }
            }
            .alert("管理操作失败", isPresented: Binding(
                get: { model.administration.errorMessage != nil },
                set: { if !$0 { model.administration.errorMessage = nil } }
            )) {
                Button("好", role: .cancel) {}
            } message: {
                Text(model.administration.errorMessage ?? "未知错误")
            }
        }
    }

    private var accountList: some View {
        List {
            Section {
                ForEach(filteredAccounts) { account in
                    accountRow(account)
                }
            } header: {
                Text("\(filteredAccounts.count) 个账户")
            } footer: {
                Text("封禁会阻止账户登录，但保留邮箱和邮件。")
            }
        }
        .overlay {
            if !model.administration.isLoading && filteredAccounts.isEmpty {
                ContentUnavailableView("没有账户", systemImage: "person.2", description: Text("服务器没有匹配的用户账户"))
            }
        }
    }

    private var temporaryAddressList: some View {
        Group {
            if access?.supportsTemporaryMail == true {
                List {
                    Section {
                        ForEach(filteredTemporaryAddresses) { address in
                            temporaryAddressRow(address)
                        }
                    } header: {
                        Text("\(filteredTemporaryAddresses.count) 个临时邮箱")
                    } footer: {
                        Text("临时邮箱收到的邮件会转发到绑定账户。")
                    }
                }
                .overlay {
                    if !model.administration.isLoading && filteredTemporaryAddresses.isEmpty {
                        ContentUnavailableView("没有临时邮箱", systemImage: "envelope.badge", description: Text("点击右上角添加"))
                    }
                }
            } else {
                ContentUnavailableView(
                    "服务器未启用临时邮箱",
                    systemImage: "envelope.badge.shield.half.filled",
                    description: Text("当前服务器版本或此管理员权限不支持 Masked Email。")
                )
            }
        }
    }

    private func accountRow(_ account: ManagedAccount) -> some View {
        HStack(spacing: 12) {
            Image(systemName: account.isSuspended ? "person.crop.circle.badge.xmark" : "person.crop.circle")
                .font(.title2)
                .foregroundStyle(account.isSuspended ? .secondary : .primary)
                .frame(width: 32)
            VStack(alignment: .leading, spacing: 3) {
                Text(account.displayName).font(.body.weight(.medium))
                Text(account.emailAddress).font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
            if isCurrentAccount(account) {
                Text("当前管理员").font(.caption2).foregroundStyle(.secondary)
            } else if account.isSuspended {
                Text("已封禁").font(.caption.weight(.medium)).foregroundStyle(.secondary)
            }
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            if access?.canDeleteAccounts == true && !isCurrentAccount(account) {
                Button("删除", role: .destructive) { accountPendingDeletion = account }
            }
            if access?.canUpdateAccounts == true && !isCurrentAccount(account) {
                Button(account.isSuspended ? "解封" : "封禁") {
                    Task { await setSuspended(!account.isSuspended, account: account) }
                }
                .tint(.gray)
            }
        }
    }

    private func temporaryAddressRow(_ address: TemporaryAddress) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(address.email).font(.body.weight(.medium))
                Spacer()
                Text(address.isEnabled ? "启用" : "停用")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            if let description = address.description, !description.isEmpty {
                Text(description).font(.caption).foregroundStyle(.secondary)
            }
            if let expiry = address.expiresAt {
                Text("到期：\(expiry.formatted(date: .abbreviated, time: .shortened))")
                    .font(.caption2).foregroundStyle(.tertiary)
            }
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            if access?.canDeleteTemporaryMail == true {
                Button("删除", role: .destructive) { addressPendingDeletion = address }
            }
            if access?.canUpdateTemporaryMail == true {
                Button(address.isEnabled ? "停用" : "启用") {
                    Task { await setEnabled(!address.isEnabled, address: address) }
                }
                .tint(.gray)
            }
        }
    }

    private var access: AdministrationAccess? {
        model.administration.access(for: model.accounts.selectedAccount)
    }

    private var canCreate: Bool {
        section == .accounts ? access?.canCreateAccounts == true : access?.canCreateTemporaryMail == true
    }

    private var filteredAccounts: [ManagedAccount] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return model.administration.accounts }
        return model.administration.accounts.filter {
            $0.emailAddress.localizedCaseInsensitiveContains(query) || $0.displayName.localizedCaseInsensitiveContains(query)
        }
    }

    private var filteredTemporaryAddresses: [TemporaryAddress] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return model.administration.temporaryAddresses }
        return model.administration.temporaryAddresses.filter {
            $0.email.localizedCaseInsensitiveContains(query) || ($0.description?.localizedCaseInsensitiveContains(query) == true)
        }
    }

    private func isCurrentAccount(_ account: ManagedAccount) -> Bool {
        guard let currentEmail = model.accounts.selectedAccount?.emailAddress else { return false }
        return account.emailAddress.caseInsensitiveCompare(currentEmail) == .orderedSame
    }

    private func refresh() async {
        guard let account = model.accounts.selectedAccount, let password = try? model.password(for: account) else { return }
        await model.administration.refresh(account: account, password: password)
    }

    private func setSuspended(_ suspended: Bool, account managedAccount: ManagedAccount) async {
        guard let account = model.accounts.selectedAccount, let password = try? model.password(for: account) else { return }
        await model.administration.setSuspended(suspended, managedAccount: managedAccount, account: account, password: password)
    }

    private func delete(_ managedAccount: ManagedAccount) async {
        guard let account = model.accounts.selectedAccount, let password = try? model.password(for: account) else { return }
        await model.administration.deleteAccount(managedAccount, account: account, password: password)
        accountPendingDeletion = nil
    }

    private func setEnabled(_ enabled: Bool, address: TemporaryAddress) async {
        guard let account = model.accounts.selectedAccount, let password = try? model.password(for: account) else { return }
        await model.administration.setTemporaryAddress(address, enabled: enabled, account: account, password: password)
    }

    private func delete(_ address: TemporaryAddress) async {
        guard let account = model.accounts.selectedAccount, let password = try? model.password(for: account) else { return }
        await model.administration.deleteTemporaryAddress(address, account: account, password: password)
        addressPendingDeletion = nil
    }
}

private struct CreateManagedAccountView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ManagedAccountDraft()

    var body: some View {
        NavigationStack {
            Form {
                Section("邮箱") {
                    TextField("账户名", text: $draft.localPart)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Picker("域名", selection: $draft.domainID) {
                        Text("请选择").tag("")
                        ForEach(model.administration.domains) { domain in Text(domain.name).tag(domain.id) }
                    }
                    TextField("显示名称（可选）", text: $draft.displayName)
                }
                Section("初始密码") {
                    SecureField("密码", text: $draft.password)
                }
            }
            .navigationTitle("添加账户")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("创建") { Task { await create() } }
                        .disabled(draft.localPart.isEmpty || draft.domainID.isEmpty || draft.password.isEmpty || model.administration.isLoading)
                }
            }
        }
    }

    private func create() async {
        guard let account = model.accounts.selectedAccount, let password = try? model.password(for: account) else { return }
        if await model.administration.createAccount(draft, account: account, password: password) { dismiss() }
    }
}

private struct CreateTemporaryAddressView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var draft = TemporaryAddressDraft()

    var body: some View {
        NavigationStack {
            Form {
                Section("地址") {
                    TextField("前缀（留空自动生成）", text: $draft.prefix)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    TextField("邮箱域名（留空使用默认域名）", text: $draft.domain)
                        .textInputAutocapitalization(.never)
                    TextField("用途说明", text: $draft.description)
                    TextField("仅用于网站域名（可选）", text: $draft.forDomain)
                        .textInputAutocapitalization(.never)
                }
            }
            .navigationTitle("添加临时邮箱")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("创建") { Task { await create() } }
                        .disabled(model.administration.isLoading)
                }
            }
        }
    }

    private func create() async {
        guard let account = model.accounts.selectedAccount, let password = try? model.password(for: account) else { return }
        if await model.administration.createTemporaryAddress(draft, account: account, password: password) { dismiss() }
    }
}
