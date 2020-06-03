import type { Fn0 } from "@thi.ng/api";
import type { IAtom } from "@thi.ng/atom";
import type { ISubscribable } from "@thi.ng/rstream";

/**
 * Main hdom2020 component interface/contract. Also see
 * {@link Component} for a flexible base class, implementing this
 * interface.
 */
export interface IComponent<T = any> {
    /**
     * This component's main DOM element, i.e. usually the element
     * created when the component is {@link IComponent.mount}ed. This
     * element will be used as default by various helper methods in the
     * {@link Component} class.
     */
    el?: Element;
    /**
     * Async component lifecycle method to initialize & attach the
     * component in the target DOM. The optional additional varargs are
     * only used by some component wrappers and are context specific to
     * each.
     *
     * @param parent
     * @param xs
     */
    mount(parent: Element, ...xs: any[]): Promise<Element>;
    /**
     * Async component lifecycle method to remove the component from the
     * target DOM and release any other internal resources (e.g.
     * subscriptions).
     */
    unmount(): Promise<void>;
    /**
     * Component update lifecycle method. Not always used, but if it is
     * then intended to perform internal updates to reflect incoming
     * `state` arg in the DOM and/or child components.
     */
    update(state?: T): void;
}

/**
 * Specialized version of {@link IComponent} which requires an
 * additional state arg for the component's `mount()` lifecycle method.
 *
 * @remarks
 * This interface is used to connect an otherwise stateless component
 * with a state provider (e.g. {@link $sub}).
 */
export interface IMountWith<T, M> extends IComponent<T> {
    /**
     * Component mount lifecycle method which also receives initial
     * state value, presumably meant for populating component.
     *
     * @param parent
     * @param state
     */
    mount(parent: Element, state: M): Promise<Element>;
}

/**
 * Specialized version of {@link IMountWith} which receives an
 * {@link @thi.ng/atom#IAtom} as state value.
 */
export type IMountWithAtom<T> = IMountWith<T, IAtom<T>>;

/**
 * Syntax sugar for {@link IMountWith}.
 */
export type IMountWithState<T> = IMountWith<T, T>;

/**
 * Component type returned by {@link $compile}.
 */
export interface CompiledComponent extends IComponent {
    subs?: ISubscribable<any>[];
    children?: IComponent[];
}

export type ComponentLike = IComponent | [string | Function, ...(any | null)[]];

export type Callback = Fn0<void>;

export type Task = Fn0<void>;

/**
 * Interface for task schedulers. See {@link NullScheduler} and
 * {@link RAFScheduler}.
 */
export interface IScheduler {
    add(scope: any, task: Task): void;
    cancel(scope: any): void;
}
