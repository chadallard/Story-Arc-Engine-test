// Context — Story Arc Engine first (arc prompt), then Inner Self
const modifier = (text) => {
  text = onContext_SAE(text);
  globalThis.text = text;
  InnerSelf("context");
  return { text: globalThis.text, stop: globalThis.stop ?? false };
};
modifier(text);
