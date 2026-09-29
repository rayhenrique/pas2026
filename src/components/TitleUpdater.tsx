
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppSettings } from "@/contexts/AppSettingsContext";

export function TitleUpdater() {
    const { settings } = useAppSettings();
    const location = useLocation();

    useEffect(() => {
        if (!settings?.app_name) return;

        if (location.pathname === "/") {
            return;
        }

        if (location.pathname === "/login") {
            document.title = `Login | ${settings.app_name}`;
            return;
        }

        document.title = `${settings.app_name}${settings.current_year ? ` - ${settings.current_year}` : ""}`;
    }, [location.pathname, settings]);

    return null;
}
