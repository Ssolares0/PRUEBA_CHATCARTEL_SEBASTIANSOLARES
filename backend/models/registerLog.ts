import LogModel from "./logModel";

async function registerLog(
  userId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  resource: "USER" | "PROJECT" | "TASK"
): Promise<void> {
  try {
    const log = new LogModel({
      userId,
      action,
      resource,
    });

    await log.save();
    console.log("Log registrado con éxito:", log);
  } catch (error) {
    console.error("Error al registrar el log:", error);
  }
}

export default registerLog;
