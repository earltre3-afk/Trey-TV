let duckingCallbacks: {
  onDuck: (() => void) | null;
  onUnduck: (() => void) | null;
} = {
  onDuck: null,
  onUnduck: null,
};

export function setNotificationDuckingCallbacks(
  onDuck: (() => void) | null,
  onUnduck: (() => void) | null,
) {
  duckingCallbacks = { onDuck, onUnduck };
}

export function getNotificationDuckingCallbacks() {
  return duckingCallbacks;
}
