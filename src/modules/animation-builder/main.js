import { Toaster } from "@/components/ui/sonner";
import Editor from "@/editor/Editor";
import domReady from "@wordpress/dom-ready";
import { AppContextProvider } from "./context/app.context";
import "./index.css";
import RegisterFreePreset from "./lib/registerFreePreset";
import RegisterPreset from "./lib/registerPreset";

window.AAEAnimBuilder = {};
AAEAnimBuilder.presets = new RegisterPreset();
AAEAnimBuilder.freePresets = new RegisterFreePreset();
AAEAnimBuilder.hooks = wp.hooks.createHooks();

domReady(function () {
  const editor_panel = document.getElementById(
    "wcf--animation-builder--editor"
  );

  wp.element.render(
    <AppContextProvider>
      <Editor />
    </AppContextProvider>,
    editor_panel
  );
});

domReady(function () {
  const editor_panel = document.getElementById("wcf--animation-builder--toast");
  wp.element.render(<Toaster position="top-right" />, editor_panel);
});
