import "./style.css";
import { setupCounter } from "./counter.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1 class="text-2xl text-neutral-900 dark:text-neutral-100">Game UI</h1>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
