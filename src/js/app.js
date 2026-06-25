import { qs, mount } from "./core/dom.js";
import { resolveInitialTheme, applyTheme } from "./ui/theme.js";
import { renderHeader } from "./ui/header.js";
import { renderFooter } from "./ui/footer.js";

applyTheme(resolveInitialTheme());

const headerHost = qs('[data-shell="header"]');
const footerHost = qs('[data-shell="footer"]');

if (headerHost) mount(headerHost, renderHeader());
if (footerHost) mount(footerHost, renderFooter());
