export default i18n;
declare const i18n: import("vue-i18n").I18n<{
    en: {
        welcome: string;
        login: string;
        logout: string;
        sidebar: {
            logout: string;
            login_oauth2: string;
            dashboard: string;
            report: string;
            budget: string;
            groups: string;
            goals: string;
            home: string;
            toggle_theme: string;
        };
        account_management: {
            title: string;
            basic_profile_information: string;
            security: string;
            preferences: string;
            account_connections: string;
            username_label: string;
            email_label: string;
            profile_picture_label: string;
            language_label: string;
            save_changes: string;
            current_password_label: string;
            new_password_label: string;
            change_password: string;
            two_factor_auth_label: string;
            email_notifications_label: string;
            push_notifications_label: string;
            dark_theme_label: string;
            connect_google: string;
            disconnect_google: string;
            nubank: string;
            banco_do_brasil: string;
            itau: string;
            connect_to_bank: string;
            bank_login_label: string;
            bank_password_label: string;
            cancel: string;
            generate_certificate: string;
            verification_code_label: string;
            verify_code: string;
            send_code: string;
            alert_settings: string;
            alert_days_before_label: string;
        };
        subscription_management: {
            title: string;
            current_plan: string;
            status: string;
            change_plan_instructions: string;
            plans: {
                monthly: string;
                annual: string;
            };
            change_to: string;
            manage_subscription: string;
            cancel_subscription: string;
            statuses: {
                active: string;
                trialing: string;
                canceled: string;
                inactive: string;
            };
        };
        budget: {
            title: string;
        };
        income: {
            title: string;
            save: string;
            monthly_title: string;
            no_entries: string;
        };
        expense: {
            title: string;
            save: string;
            monthly_title: string;
            no_entries: string;
            share_with_group: string;
        };
        common: {
            date: string;
            amount: string;
            description: string;
            payment_method: string;
            category: string;
            select_group: string;
            select_month: string;
            year: string;
            close: string;
            cancel: string;
        };
        validation: {
            required: string;
            invalid_currency: string;
        };
        overview: {
            title: string;
            total_income: string;
            total_expenses: string;
            savings: string;
        };
        trends: {
            title: string;
            select_chart_type: string;
            select_time_period: string;
            select_expense_category: string;
        };
        budget_tracker: {
            title: string;
        };
        group_management: {
            title: string;
            create_group: string;
            group_name: string;
            group_description: string;
            create_group_button: string;
            manage_members: string;
            select_group: string;
            user_email: string;
            invite_member: string;
            group_members: string;
            no_members: string;
            success_message: string;
            error_message: string;
        };
        financial_goals: {
            title: string;
            goal_name: string;
            category: string;
            target_amount: string;
            initial_amount: string;
            contribution_frequency: string;
            periodicity: string;
            deadline: string;
            update: string;
            add: string;
            new_goal: string;
            progress: string;
            contribution_history: string;
            amount: string;
            date: string;
            target_amount_label: string;
            total_income: string;
            total_expense: string;
            deadline_label: string;
            not_feasible: string;
            no_goals: string;
            suggested_goals_title: string;
            get_suggestions: string;
            no_suggestions: string;
        };
    };
    pt: {
        welcome: string;
        login: string;
        logout: string;
        sidebar: {
            logout: string;
            login_oauth2: string;
            dashboard: string;
            report: string;
            budget: string;
            groups: string;
            goals: string;
            home: string;
            toggle_theme: string;
        };
        account_management: {
            title: string;
            basic_profile_information: string;
            security: string;
            preferences: string;
            account_connections: string;
            username_label: string;
            email_label: string;
            profile_picture_label: string;
            language_label: string;
            save_changes: string;
            current_password_label: string;
            new_password_label: string;
            change_password: string;
            two_factor_auth_label: string;
            email_notifications_label: string;
            push_notifications_label: string;
            dark_theme_label: string;
            connect_google: string;
            disconnect_google: string;
            connect_to_bank: string;
            bank_login_label: string;
            bank_password_label: string;
            generate_certificate: string;
            verification_code_label: string;
            verify_code: string;
            send_code: string;
            alert_settings: string;
            alert_days_before_label: string;
        };
        subscription_management: {
            title: string;
            current_plan: string;
            status: string;
            change_plan_instructions: string;
            plans: {
                monthly: string;
                annual: string;
            };
            change_to: string;
            manage_subscription: string;
            cancel_subscription: string;
            statuses: {
                active: string;
                trialing: string;
                canceled: string;
                inactive: string;
            };
        };
        budget: {
            title: string;
        };
        income: {
            title: string;
            save: string;
            monthly_title: string;
            no_entries: string;
        };
        expense: {
            title: string;
            save: string;
            monthly_title: string;
            no_entries: string;
            share_with_group: string;
        };
        trends: {
            title: string;
            select_chart_type: string;
            select_time_period: string;
            select_expense_category: string;
        };
        budget_tracker: {
            title: string;
        };
        common: {
            date: string;
            amount: string;
            description: string;
            payment_method: string;
            category: string;
            select_group: string;
            select_month: string;
            year: string;
            close: string;
            cancel: string;
        };
        validation: {
            required: string;
            positive_number: string;
            invalid_currency: string;
            future_date: string;
        };
        overview: {
            title: string;
            total_income: string;
            total_expenses: string;
            savings: string;
        };
        financial_goals: {
            title: string;
            goal_name: string;
            category: string;
            target_amount: string;
            initial_amount: string;
            contribution_frequency: string;
            periodicity: string;
            deadline: string;
            update: string;
            add: string;
            new_goal: string;
            progress: string;
            contribution_history: string;
            amount: string;
            date: string;
            target_amount_label: string;
            total_income: string;
            total_expense: string;
            deadline_label: string;
            not_feasible: string;
            no_goals: string;
            suggested_goals_title: string;
            get_suggestions: string;
            no_suggestions: string;
        };
        group_management: {
            title: string;
            create_group: string;
            group_name: string;
            group_description: string;
            create_group_button: string;
            manage_members: string;
            select_group: string;
            user_email: string;
            invite_member: string;
            group_members: string;
            no_members: string;
            success_message: string;
            error_message: string;
        };
    };
}, {}, {}, string, true>;
