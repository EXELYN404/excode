export type ThemeType = "dark";

export interface ExcodeTheme {
  name: string;
  type: ThemeType;
  colors: Record<string, string>;
}
