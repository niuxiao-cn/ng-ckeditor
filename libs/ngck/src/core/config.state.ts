import {Injectable} from "@angular/core";
import {Config} from "./interfaces";
import {cloneDeepWith, isElement, isPlainObject} from "lodash-es";
import {produce} from 'immer'
import {Element} from "@angular/compiler";

@Injectable()
export class ConfigState extends Config {
    define(name: string, value: unknown): void
    define(config: Record<string, unknown>): void
    define(name: string | Record<string, unknown>, value?: unknown): void {
        const isDefine = true
        this.set((config) => produce(config, draft => {
            this._setToTarget(draft, name, value, isDefine)
        }))
    }

    getConfig(name: string): unknown {
        return this._getFormSource(this.get(), name)
    }

    * names(): Iterable<string> {
        for(const name of Object.keys(this.get())) {
            yield name
        }
    }

    setConfig(name: string, value: unknown): void;
    setConfig(config: Record<string, unknown>): void;
    setConfig(name: string | Record<string, unknown>, value?: unknown): void;
    setConfig(name: string | Record<string, unknown>, value?: unknown): void {
        this.set(config => produce(config, draft => {
            this._setToTarget(draft, name, value)
        }))
    }

    private _setToTarget(target: Record<string, unknown>, name: string | Record<string, unknown>, value: unknown, isDefine: boolean = false): void {
        if(isPlainObject(name)) {
            this._setObjectToTarget(target, name as Record<string, boolean>, isDefine)
            return
        }
        const nameStr = name as string
        const parts = nameStr.split(".")
        const _name  = parts.pop()
        for(const part of parts) {
            if(!isPlainObject(target[part])) {
                target[part] = {}
            }
            target = target[part] as Record<string, unknown>
        }

        if(!_name) {
            return ;
        }

        if(isPlainObject(value)) {
            if(!isPlainObject(target[_name])) {
                target[_name] = {}
            }
            target = target[_name] as Record<string, unknown>
            this._setObjectToTarget(target, value as Record<string, unknown>, isDefine)
            return
        }
        if(isDefine && typeof target[_name] !== 'undefined') {
            return ;
        }
        target[_name] = value
    }

    private _setObjectToTarget(target: Record<string, unknown>, value: Record<string, unknown>, isDefine: boolean): void {
        Object.keys(value).forEach(key => {
            this._setToTarget(target, key, value[key], isDefine)
        })
    }

    private _getFormSource(source: Record<string, unknown>, name: string): unknown {
        const parts = name.split(".")
        name = parts.pop() ?? ""
        let _source: Record<string, unknown> | null = source
        for(const part of parts) {
            if(!isPlainObject(_source[part])) {
                _source = null
                break;
            }
            _source = _source[part] as Record<string, unknown>
        }
        return source ? this.cloneConfig(source[name]) : undefined
    }

    private cloneConfig<T>(source: T): T {
        return cloneDeepWith(source, this.leaveDOMReferences)
    }

    private leaveDOMReferences(value: Element | undefined): unknown {
        return isElement(value) ? value : undefined
    }
}
