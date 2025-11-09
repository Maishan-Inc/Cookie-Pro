"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteByKey = getSiteByKey;
exports.getDevice = getDevice;
exports.upsertDevice = upsertDevice;
exports.insertConsent = insertConsent;
exports.latestConsent = latestConsent;
exports.insertEvents = insertEvents;
exports.getDashboard = getDashboard;
var supabase_1 = require("@/lib/supabase");
var client = function () { return (0, supabase_1.getServiceRoleClient)(); };
function getSiteByKey(siteKey) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, client()
                        .from("sites")
                        .select("*")
                        .eq("site_key", siteKey)
                        .maybeSingle()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error || !data) {
                        throw new Error("Site not found for key ".concat(siteKey));
                    }
                    return [2 /*return*/, data];
            }
        });
    });
}
function getDevice(siteId, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, client()
                        .from("devices")
                        .select("*")
                        .eq("site_id", siteId)
                        .eq("device_id", deviceId)
                        .maybeSingle()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error && error.code !== "PGRST116")
                        throw error;
                    return [2 /*return*/, data !== null && data !== void 0 ? data : null];
            }
        });
    });
}
function upsertDevice(siteId, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
        var now, payload, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = new Date().toISOString();
                    payload = {
                        site_id: siteId,
                        device_id: deviceId,
                        last_seen_at: now,
                    };
                    return [4 /*yield*/, client().from("devices").upsert(payload, {
                            onConflict: "site_id,device_id",
                        })];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    return [2 /*return*/];
            }
        });
    });
}
function insertConsent(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var payload, error;
        var siteId = _b.siteId, deviceId = _b.deviceId, policyVersion = _b.policyVersion, choices = _b.choices, userAgent = _b.userAgent, ipTruncated = _b.ipTruncated;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    payload = {
                        site_id: siteId,
                        device_id: deviceId,
                        policy_version: policyVersion,
                        choices: choices,
                        user_agent: userAgent,
                        ip_truncated: ipTruncated,
                    };
                    return [4 /*yield*/, client().from("consents").upsert(payload, {
                            onConflict: "site_id,device_id,policy_version",
                        })];
                case 1:
                    error = (_c.sent()).error;
                    if (error)
                        throw error;
                    return [2 /*return*/];
            }
        });
    });
}
function latestConsent(siteId, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, client()
                        .from("consents")
                        .select("*")
                        .eq("site_id", siteId)
                        .eq("device_id", deviceId)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .maybeSingle()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error && error.code !== "PGRST116")
                        throw error;
                    return [2 /*return*/, data !== null && data !== void 0 ? data : null];
            }
        });
    });
}
function insertEvents(entries) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!entries.length)
                        return [2 /*return*/];
                    return [4 /*yield*/, client().from("events").insert(entries)];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    return [2 /*return*/];
            }
        });
    });
}
function getDashboard(siteKey) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, client().rpc("get_consent_dashboard", {
                        p_site_key: siteKey,
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data !== null && data !== void 0 ? data : []];
            }
        });
    });
}
