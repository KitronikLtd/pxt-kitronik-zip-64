//% deprecated
namespace GAME_ZIP64 {

}

namespace modules {

}

namespace servers {
    function start() {
        jacdac.productIdentifier = 0x34ef625e
        jacdac.startSelfServers(() => {
            const servers: jacdac.Server[] = [
                
            ]
            return servers
        })
    }
    start()
}