interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ASGARDEO_CLIENT_ID: string;
  readonly VITE_ASGARDEO_BASE_URL: string;
  readonly VITE_MODEL_DEPLOYMENT_NAME?: string;
  readonly VITE_AZURE_API_KEY?: string;
  readonly VITE_PROJECT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}