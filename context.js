// Context — Inner Self + Story Arc Engine
InnerSelf("context");
const modifier = (text) => {
  text = onContext_SAE(text);
  return { text, stop };
};
modifier(text);
