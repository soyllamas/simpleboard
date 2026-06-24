#!/usr/bin/env python3
import json
import re
import sys


ENV_PATH = re.compile(r"(^|[^A-Za-z0-9_.-])\.env($|[^A-Za-z0-9_-])")
ENV_EXAMPLE_PATH = re.compile(r"(^|[^A-Za-z0-9_.-])\.env\.example($|[^A-Za-z0-9_.-])")


def is_protected_env_path(value):
	if not isinstance(value, str):
		return False

	value_without_allowed_examples = ENV_EXAMPLE_PATH.sub(" ", value)
	return bool(ENV_PATH.search(value_without_allowed_examples))


def text_contains_protected_env_path(value):
	return isinstance(value, str) and is_protected_env_path(value)


def collect_strings(value):
	if isinstance(value, str):
		yield value
	elif isinstance(value, dict):
		for nested in value.values():
			yield from collect_strings(nested)
	elif isinstance(value, list):
		for nested in value:
			yield from collect_strings(nested)


def deny(reason):
	print(
		json.dumps(
			{
				"hookSpecificOutput": {
					"hookEventName": "PreToolUse",
					"permissionDecision": "deny",
					"permissionDecisionReason": reason,
				}
			}
		)
	)


def main():
	try:
		payload = json.load(sys.stdin)
	except json.JSONDecodeError:
		return

	tool_name = payload.get("tool_name")
	tool_input = payload.get("tool_input", {})

	if tool_name == "Bash":
		command = tool_input.get("command")
		if text_contains_protected_env_path(command):
			deny("Reading or writing .env files is blocked. .env.example is allowed.")
		return

	if tool_name == "apply_patch":
		command = tool_input.get("command")
		if text_contains_protected_env_path(command):
			deny("Writing .env files is blocked. .env.example is allowed.")
		return

	if any(is_protected_env_path(value) for value in collect_strings(tool_input)):
		deny("Reading or writing .env files is blocked. .env.example is allowed.")


if __name__ == "__main__":
	main()
