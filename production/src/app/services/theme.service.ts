import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })

export class ThemeService {
    setTheme(vars: Record<string, string>) {
        const root = document.documentElement;

        for (const key in vars) {
            root.style.setProperty(key, vars[key]);
        }
    }
}