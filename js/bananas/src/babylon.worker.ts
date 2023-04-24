import { 
    CanvasProps,
    WorkerService, remoteGraphRoutes, workerCanvasRoutes, 
} from 'graphscript'//'../../graphscript/index'//'graphscript'

declare var WorkerGlobalScope

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {

    const graph = new WorkerService({
        roots:{
            ...workerCanvasRoutes,
            ...remoteGraphRoutes,
            receiveBabylonCanvas:function(
                options:CanvasProps
            ) {
                
            }
        }
    });

}


export default self as any;