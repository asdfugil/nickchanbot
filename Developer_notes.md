You can set the following property in the index.json of a module
`clientPermissions` : The default required bot permission for this module
No need to specify SEND_MESSAGES,VIEW_CHANNEL and READ_MESSAGE_HISTORY
Voice permissions needs to be handled seperately
`userPermissions` : The required permission of the command invoker
`description` : module descritpion
`nsfw`: default value of `this.nsfw` for all the commands under it