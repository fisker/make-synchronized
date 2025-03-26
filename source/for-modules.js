import Synchronizer from './synchronizer.js'

function makeDefaultExportSynchronized(module) {
  return Synchronizer.create(module).get('default')
}

function makeModuleSynchronized(module) {
  return Synchronizer.create(module).createModule()
}

export {makeDefaultExportSynchronized, makeModuleSynchronized}
