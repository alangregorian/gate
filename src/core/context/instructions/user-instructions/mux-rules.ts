import path from "path"
import { ensureRulesDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import { formatResponse } from "@core/prompts/responses"
import fs from "fs/promises"
import { MUXRulesToggles } from "@shared/mux-rules"
import { getGlobalState, getWorkspaceState, updateGlobalState, updateWorkspaceState } from "@core/storage/state"
import * as vscode from "vscode"
import { synchronizeRuleToggles, getRuleFilesTotalContent } from "@core/context/instructions/user-instructions/rule-helpers"

export const getGlobalMUXRules = async (globalMUXRulesFilePath: string, toggles: MUXRulesToggles) => {
	if (await fileExistsAtPath(globalMUXRulesFilePath)) {
		if (await isDirectory(globalMUXRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(globalMUXRulesFilePath)
				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, globalMUXRulesFilePath, toggles)
				if (rulesFilesTotalContent) {
					const muxRulesFileInstructions = formatResponse.muxRulesGlobalDirectoryInstructions(
						globalMUXRulesFilePath,
						rulesFilesTotalContent,
					)
					return muxRulesFileInstructions
				}
			} catch {
				console.error(`Failed to read .muxrules directory at ${globalMUXRulesFilePath}`)
			}
		} else {
			console.error(`${globalMUXRulesFilePath} is not a directory`)
			return undefined
		}
	}

	return undefined
}

export const getLocalMUXRules = async (cwd: string, toggles: MUXRulesToggles) => {
	const muxRulesFilePath = path.resolve(cwd, GlobalFileNames.muxRules)

	let muxRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(muxRulesFilePath)) {
		if (await isDirectory(muxRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(muxRulesFilePath, [[".muxrules", "workflows"]])

				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					muxRulesFileInstructions = formatResponse.muxRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read .muxrules directory at ${muxRulesFilePath}`)
			}
		} else {
			try {
				if (muxRulesFilePath in toggles && toggles[muxRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(muxRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						muxRulesFileInstructions = formatResponse.muxRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .muxrules file at ${muxRulesFilePath}`)
			}
		}
	}

	return muxRulesFileInstructions
}

export async function refreshMUXRulesToggles(
	context: vscode.ExtensionContext,
	workingDirectory: string,
): Promise<{
	globalToggles: MUXRulesToggles
	localToggles: MUXRulesToggles
}> {
	// Global toggles
	const globalMUXRulesToggles = ((await getGlobalState(context, "globalMUXRulesToggles")) as MUXRulesToggles) || {}
	const globalMUXRulesFilePath = await ensureRulesDirectoryExists()
	const updatedGlobalToggles = await synchronizeRuleToggles(globalMUXRulesFilePath, globalMUXRulesToggles)
	await updateGlobalState(context, "globalMUXRulesToggles", updatedGlobalToggles)

	// Local toggles
	const localMUXRulesToggles = ((await getWorkspaceState(context, "localMUXRulesToggles")) as MUXRulesToggles) || {}
	const localMUXRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.muxRules)
	const updatedLocalToggles = await synchronizeRuleToggles(localMUXRulesFilePath, localMUXRulesToggles, "", [
		[".muxrules", "workflows"],
	])
	await updateWorkspaceState(context, "localMUXRulesToggles", updatedLocalToggles)

	return {
		globalToggles: updatedGlobalToggles,
		localToggles: updatedLocalToggles,
	}
}
