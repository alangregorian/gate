import path from "path"
import { GlobalFileNames } from "@core/storage/disk"
import { MUXRulesToggles } from "@shared/mux-rules"
import { getWorkspaceState, updateWorkspaceState } from "@core/storage/state"
import * as vscode from "vscode"
import { synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers"

/**
 * Refresh the workflow toggles
 */
export async function refreshWorkflowToggles(
	context: vscode.ExtensionContext,
	workingDirectory: string,
): Promise<MUXRulesToggles> {
	const workflowRulesToggles = ((await getWorkspaceState(context, "workflowToggles")) as MUXRulesToggles) || {}
	const workflowsDirPath = path.resolve(workingDirectory, GlobalFileNames.workflows)
	const updatedWorkflowToggles = await synchronizeRuleToggles(workflowsDirPath, workflowRulesToggles)
	await updateWorkspaceState(context, "workflowToggles", updatedWorkflowToggles)
	return updatedWorkflowToggles
}
