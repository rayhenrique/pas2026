
import { useEffect } from "react";
import { useAppSettings } from "@/contexts/AppSettingsContext";

export function TitleUpdater() {
    const { settings } = useAppSettings();

    useEffect(() => {
        if (settings?.app_name) {
            document.title = `${settings.app_name} ${settings.current_year ? `- ${settings.current_year}` : ""}`;
        }
    }, [settings]);

    return null;
}
