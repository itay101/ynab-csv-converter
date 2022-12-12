export interface FetchConfigAccount {
    account_id: string;
    type: string;
    file_path: string;
    export_file_path: string;
    username: string;
    password: string;
    skip_automation: boolean
}

export interface FetchConfig {
    token: string;
    budget_id?: string;
    accounts?: FetchConfigAccount[];
}
