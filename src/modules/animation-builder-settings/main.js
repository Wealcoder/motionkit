import domReady from "@wordpress/dom-ready";
import MainPage from "./pages";
import { AppContextProvider } from "@@/context/app.context";
import { Toaster } from "@@//components/ui/sonner";
import "./index.css";

document.querySelector("body").classList.add("wcfabs2025");

domReady(function () {
  const editor_panel = document.getElementById("aae-anim-builder");

  wp.element.render(
    <AppContextProvider>
      <MainPage />
    </AppContextProvider>,
    editor_panel
  );
});

domReady(function () {
  const editor_panel = document.getElementById("aae-anim-builder--toast");

  wp.element.render(<Toaster position="top-right" />, editor_panel);
});
