"use client";

import PageHeader from "@/app/components/crm/PageHeader";
import ChangePasswordForm from "@/app/components/settings/ChangePasswordForm";

export default function SettingsPage() {
    return (
        <div>
            <PageHeader
                title="Settings"
                buttonLabel=""
                onClick={() => {}}
            />

            <ChangePasswordForm />
        </div>
    );
}