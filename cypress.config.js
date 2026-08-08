import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
  	baseUrl: 'http://localhost:8888/',
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
  projectId: "j5r4nw",
});
