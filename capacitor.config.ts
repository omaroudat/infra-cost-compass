import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d502ede2f136402bbee2ced345befcb1',
  appName: 'infra-cost-compass',
  webDir: 'dist',
  server: {
    url: 'https://d502ede2-f136-402b-bee2-ced345befcb1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;