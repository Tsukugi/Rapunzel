package com.rapunzel;

import android.content.Context;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/** Selects a validated OTA bundle before the React Native bridge starts. */
public final class OtaBundleLoader {
  private static final int SCHEMA = 1;
  private static final String NATIVE_COMPATIBILITY = "rn-0.72.6-hermes";

  private OtaBundleLoader() {}

  public static String getBundleFile(Context context, boolean debug, String embeddedVersion) {
    if (debug) {
      return null;
    }

    File otaDirectory = new File(context.getFilesDir(), "ota");
    File activeRecord = new File(otaDirectory, "active.json");
    JSONObject record = readJson(activeRecord);
    if (!isValidRecord(record, otaDirectory)) {
      return null;
    }

    JSONObject pending = record.optJSONObject("pending");
    if (pending != null) {
      if (pending.optBoolean("attempted", false)) {
        record.remove("pending");
        writeJson(activeRecord, record);
        return getNewerReferencePath(
            record.optJSONObject("current"), otaDirectory, embeddedVersion);
      }

      String pendingPath = getNewerReferencePath(pending, otaDirectory, embeddedVersion);
      if (pendingPath == null) {
        record.remove("pending");
        writeJson(activeRecord, record);
        return getNewerReferencePath(
            record.optJSONObject("current"), otaDirectory, embeddedVersion);
      }

      try {
        pending.put("attempted", true);
        writeJson(activeRecord, record);
      } catch (JSONException ignored) {
        return null;
      }
      return pendingPath;
    }

    return getNewerReferencePath(
        record.optJSONObject("current"), otaDirectory, embeddedVersion);
  }

  private static boolean isValidRecord(JSONObject record, File otaDirectory) {
    if (record == null
        || record.optInt("schema", -1) != SCHEMA
        || !NATIVE_COMPATIBILITY.equals(record.optString("nativeCompatibility"))) {
      return false;
    }

    JSONObject current = record.optJSONObject("current");
    JSONObject pending = record.optJSONObject("pending");
    return (current == null || isValidReference(current, otaDirectory))
        && (pending == null
            || (pending.has("attempted")
                && !pending.isNull("attempted")
                && pending.opt("attempted") instanceof Boolean
                && isValidReference(pending, otaDirectory)));
  }

  private static boolean isValidReference(JSONObject reference, File otaDirectory) {
    return reference != null
        && reference.optString("version").length() > 0
        && NATIVE_COMPATIBILITY.equals(reference.optString("nativeCompatibility"))
        && getReferencePath(reference, otaDirectory) != null;
  }

  private static String getReferencePath(JSONObject reference, File otaDirectory) {
    if (reference == null) {
      return null;
    }

    String path = reference.optString("bundlePath", "");
    try {
      File root = otaDirectory.getCanonicalFile();
      File bundle = new File(path).getCanonicalFile();
      String rootPath = root.getPath() + File.separator;
      if (!bundle.getPath().startsWith(rootPath) || !bundle.isFile()) {
        return null;
      }
      return bundle.getPath();
    } catch (Exception ignored) {
      return null;
    }
  }

  private static String getNewerReferencePath(
      JSONObject reference, File otaDirectory, String embeddedVersion) {
    if (reference == null || !isNewerVersion(reference.optString("version"), embeddedVersion)) {
      return null;
    }
    return getReferencePath(reference, otaDirectory);
  }

  private static boolean isNewerVersion(String candidate, String current) {
    try {
      String[] candidateParts = getStableVersionParts(candidate);
      String[] currentParts = getStableVersionParts(current);
      for (int index = 0; index < 3; index++) {
        int candidatePart = Integer.parseInt(candidateParts[index]);
        int currentPart = Integer.parseInt(currentParts[index]);
        if (candidatePart != currentPart) {
          return candidatePart > currentPart;
        }
      }
      return false;
    } catch (Exception ignored) {
      return false;
    }
  }

  private static String[] getStableVersionParts(String version) {
    String core = version.split("[-+]")[0];
    String[] parts = core.split("\\.");
    if (parts.length != 3) {
      throw new IllegalArgumentException("Invalid version");
    }
    for (String part : parts) {
      if (part.length() == 0) {
        throw new IllegalArgumentException("Invalid version");
      }
      Integer.parseInt(part);
    }
    return parts;
  }

  private static JSONObject readJson(File file) {
    if (!file.isFile()) {
      return null;
    }

    StringBuilder content = new StringBuilder();
    try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8))) {
      String line;
      while ((line = reader.readLine()) != null) {
        content.append(line);
      }
      return new JSONObject(content.toString());
    } catch (Exception ignored) {
      return null;
    }
  }

  private static void writeJson(File target, JSONObject value) {
    File parent = target.getParentFile();
    if (parent != null && !parent.exists() && !parent.mkdirs()) {
      return;
    }

    File temporary = new File(target.getPath() + ".native.tmp");
    byte[] content = value.toString().getBytes(StandardCharsets.UTF_8);
    try (FileOutputStream stream = new FileOutputStream(temporary)) {
      stream.write(content);
      stream.getFD().sync();
    } catch (Exception ignored) {
      return;
    }

    if (!temporary.renameTo(target)) {
      // The next launch will use the previous record if the atomic replacement
      // could not be completed.
      temporary.delete();
    }
  }
}
