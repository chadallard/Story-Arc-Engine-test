// Output — Story Arc Engine first (raw arc list), then Inner Self
const modifier = (text) => {
  text = onOutput_SAE(text);
  globalThis.text = text;
  InnerSelf("output");
  delete state.saeArcOutputPass;
  return { text: globalThis.text };
};
modifier(text);
