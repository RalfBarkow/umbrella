const std = @import("std");
const wasm = @import("wasmapi");
const dom = @import("dom");
const timer = @import("timer");
const todo = @import("api.zig");
const State = @import("state.zig");

// expose thi.ng/wasm-api core API (incl. panic handler & allocation fns)
pub usingnamespace wasm;

// allocator, also exposed & used by JS-side WasmBridge & DOM module
// see further comments in:
// https://github.com/thi-ng/umbrella/blob/develop/packages/wasm-api/zig/lib.zig
// https://github.com/thi-ng/umbrella/blob/develop/packages/wasm-api-dom/zig/events.zig
// https://github.com/thi-ng/umbrella/blob/develop/packages/wasm-api-schedule/zig/lib.zig
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
pub const WASM_ALLOCATOR = gpa.allocator();

var STATE: State = undefined;

fn onInput(e: *const dom.Event, _: ?*anyopaque) void {
    if (std.mem.eql(u8, e.body.key.getKey(), "Enter")) {
        onAddTask(e, null);
    } else if (std.mem.eql(u8, e.body.key.getKey(), "Escape")) {
        dom.setStringAttrib(dom.getElementByID("newtask"), "value", "");
    }
}

fn onAddTask(_: *const dom.Event, _: ?*anyopaque) void {
    const input = dom.getElementByID("newtask");
    const body = dom.getStringAttribAlloc(input, "value");
    defer WASM_ALLOCATOR.free(body);

    if (body.len == 0) return;

    _ = STATE.addTask(body) catch |e| @panic(@errorName(e));
    dom.setStringAttrib(input, "value", "");
    STATE.storeTasks();
}

fn initApp() !void {
    // the WASM API modules auto-initialize themselves if the root source
    // file exposes a `WASM_ALLOCATOR`, otherwise you'll have to initialize manually:
    // try dom.init(customAllocator);
    // try schedule.init(customAllocator);

    STATE = State.init(WASM_ALLOCATOR);

    _ = dom.createElement(&.{
        .tag = "div",
        .class = "w-100",
        .parent = dom.body,
        .index = 0,
        .children = &.{
            .{ .tag = "h1", .class = "mt0", .text = "ToDo List" },
            .{
                .tag = "div",
                .id = "tasks",
            },
            .{
                .tag = "div",
                .class = "flex flex-column mb3",
                .children = &.{
                    .{ .tag = "h3", .text = "Add new task" },
                    .{
                        .tag = "input",
                        .id = "newtask",
                        .class = "pa2",
                        .attribs = &.{
                            dom.Attrib.string("placeholder", "What needs to be done?"),
                            dom.Attrib.flag("autofocus", true),
                            dom.Attrib.event("keydown", .{ .callback = onInput }),
                        },
                    },
                    .{
                        .tag = "button",
                        .class = "ma0 mt2 db w-100 pa2",
                        .text = "Add Task",
                        .attribs = &.{
                            dom.Attrib.event("click", .{ .callback = onAddTask }),
                        },
                    },
                },
            },
        },
    });

    var tasks: []todo.Task = undefined;
    todo.loadTasks(&tasks);
    defer WASM_ALLOCATOR.free(tasks);

    for (tasks) |*t| {
        _ = try STATE.addExisting(State.TaskItem.initFromTask(&STATE, t));
    }
}

export fn start() void {
    initApp() catch |e| @panic(@errorName(e));
    wasm.printStr("started");
}