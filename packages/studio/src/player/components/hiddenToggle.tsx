import { Eye, EyeSlash, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

/** The action a hide toggle offers from the current `hidden` state; on audio `data-hidden` is a mute. */
export function hiddenToggleVerb(asMute: boolean, hidden: boolean): string {
  if (asMute) return hidden ? "取消静音" : "静音";
  return hidden ? "显示" : "隐藏";
}

export function HiddenToggleIcon({
  asMute,
  hidden,
  size,
}: {
  asMute: boolean;
  hidden: boolean;
  size: number;
}) {
  const Icon = asMute ? (hidden ? SpeakerSlash : SpeakerHigh) : hidden ? EyeSlash : Eye;
  return <Icon size={size} weight="bold" aria-hidden="true" />;
}
