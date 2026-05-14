import tags from "./tags.json";

export function getStackName(name: string) {
  return tags.name_app_camelcase + name;
}
