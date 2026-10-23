import type { Command } from '../commands/Command.js';
import { Arguments } from '../commands/Arguments.js';
import type { Argument } from '../commands/Argument.js';
import { InitCommand } from '../commands/InitCommand.js';
import { ReadCommand } from '../commands/ReadCommand.js';
import { SaveCommand } from '../commands/SaveCommand.js';
import { CanvasCommand } from '../commands/CanvasCommand.js';
import { CreateCommand } from '../commands/CreateCommand.js';
import { DeleteCommand } from '../commands/DeleteCommand.js';
import { MoveCommand } from '../commands/MoveCommand.js';
import { ScaleCommand } from '../commands/ScaleCommand.js';
import { SetCommand } from '../commands/SetCommand.js';
import { GroupCommand } from '../commands/GroupCommand.js';
import { UngroupCommand } from '../commands/UngroupCommand.js';
import { AddToCommand } from '../commands/AddToCommand.js';
import { FrontCommand } from '../commands/FrontCommand.js';
import { BackCommand } from '../commands/BackCommand.js';
import { TreeCommand } from '../commands/TreeCommand.js';
import { ShowCommand } from '../commands/ShowCommand.js';
import { HelpCommand } from '../commands/HelpCommand.js';
import { UndoCommand } from '../commands/UndoCommand.js';
import { RedoCommand } from '../commands/RedoCommand.js';

/** The only command-name dispatch table; future plugin registration boundary. */
export class CommandDispatcher {
  private readonly constructors = new Map<string, new (args: Arguments) => Command>([
    ['init', InitCommand],
    ['read', ReadCommand],
    ['save', SaveCommand],
    ['canvas', CanvasCommand],
    ['create', CreateCommand],
    ['delete', DeleteCommand],
    ['move', MoveCommand],
    ['scale', ScaleCommand],
    ['set', SetCommand],
    ['group', GroupCommand],
    ['ungroup', UngroupCommand],
    ['addto', AddToCommand],
    ['front', FrontCommand],
    ['back', BackCommand],
    ['tree', TreeCommand],
    ['show', ShowCommand],
    ['help', HelpCommand],
    ['undo', UndoCommand],
    ['redo', RedoCommand],
  ]);
  parse(tokens: readonly Argument[]): Command {
    const Constructor = this.constructors.get(tokens[0].value);
    if (!Constructor) throw new Error(`unknown command: ${tokens[0].value}`);
    return new Constructor(new Arguments(tokens.slice(1)));
  }
}
