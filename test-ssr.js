import { createServer } from 'vite';

(async () => {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  
  try {
    const App = await vite.ssrLoadModule('/src/App.jsx');
    console.log("App loaded successfully!");
  } catch (e) {
    console.error("Crash during SSR load:", e);
  }
  
  await vite.close();
})();
