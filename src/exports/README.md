# MUX API

The MUX extension exposes an API that can be used by other extensions. To use this API in your extension:

1. Copy `src/extension-api/mux.d.ts` to your extension's source directory.
2. Include `mux.d.ts` in your extension's compilation.
3. Get access to the API with the following code:

    ```ts
    const muxExtension = vscode.extensions.getExtension<MUXAPI>("saoudrizwan.claude-dev")

    if (!muxExtension?.isActive) {
    	throw new Error("MUX extension is not activated")
    }

    const mux = muxExtension.exports

    if (mux) {
    	// Now you can use the API

    	// Set custom instructions
    	await mux.setCustomInstructions("Talk like a pirate")

    	// Get custom instructions
    	const instructions = await mux.getCustomInstructions()
    	console.log("Current custom instructions:", instructions)

    	// Start a new task with an initial message
    	await mux.startNewTask("Hello, MUX! Let's make a new project...")

    	// Start a new task with an initial message and images
    	await mux.startNewTask("Use this design language", ["data:image/webp;base64,..."])

    	// Send a message to the current task
    	await mux.sendMessage("Can you fix the @problems?")

    	// Simulate pressing the primary button in the chat interface (e.g. 'Save' or 'Proceed While Running')
    	await mux.pressPrimaryButton()

    	// Simulate pressing the secondary button in the chat interface (e.g. 'Reject')
    	await mux.pressSecondaryButton()
    } else {
    	console.error("MUX API is not available")
    }
    ```

    **Note:** To ensure that the `saoudrizwan.claude-dev` extension is activated before your extension, add it to the `extensionDependencies` in your `package.json`:

    ```json
    "extensionDependencies": [
        "saoudrizwan.claude-dev"
    ]
    ```

For detailed information on the available methods and their usage, refer to the `mux.d.ts` file.
