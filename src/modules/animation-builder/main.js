import domReady from "@wordpress/dom-ready";
import GetStart from "./GetStart";
import { AppContextProvider } from "./context/app.context";
import { Toaster } from "@/components/ui/sonner";

import "./index.css";
import RegisterPreset from "./lib/registerPreset";

window.AAEAnimBuilder = {};

AAEAnimBuilder.presets = new RegisterPreset();
AAEAnimBuilder.hooks = wp.hooks.createHooks();

domReady(function () {
  const editor_panel = document.getElementById(
    "wcf--animation-builder--editor"
  );

  wp.element.render(
    <AppContextProvider>
      <GetStart />
    </AppContextProvider>,
    editor_panel
  );
});

domReady(function () {
  const editor_panel = document.getElementById("wcf--animation-builder--toast");

  wp.element.render(<Toaster position="top-right" />, editor_panel);
});
