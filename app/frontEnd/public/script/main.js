// toolbar
const tb = document.querySelector('#top_btn')
if (tb) {
    let ctTimer = null
    let ctTimer1 = null
    const ct = document.querySelector('.container')
    tb.style.transition = 'all .3s'
    const fn = debounce(() => {
        if (ct.scrollTop > 100) {
            tb.style.display = ''
            ctTimer1 && clearTimeout(ctTimer1)
            ctTimer1 = setTimeout(() => {
                tb.style.opacity = '1'
            }, 300);
        } else {
            tb.style.opacity = '0'
            ctTimer && clearTimeout(ctTimer)
            ctTimer = setTimeout(() => {
                tb.style.display = 'none'
            }, 300);
        }
    }, 50)
    if (ct) {
        ct.addEventListener('scroll', fn)
    }
}

const _cloudSync = localStorage.getItem('isCloudSync');
if (_cloudSync == null || _cloudSync == undefined) {
    localStorage.setItem('isCloudSync', true);
    initTheme()
}

let REFRESH_TIME = getRefteshRate((val) => {
    let refreshRateSelect = document.querySelector('#refreshRateSelect')
    refreshRateSelect && (refreshRateSelect.value = val.toString())
})

let isNeedToken = true
const MODEL = document.querySelector("#MODEL")
let QORS_MESSAGE = null
let smsSender = null
let psw_fail_num = 0;

// 初始化全局数据代理对象
window.UFI_DATA = new Proxy({}, {
    set(target, prop, value) {
        target[prop] = value;
        chartUpdater && chartUpdater(prop, value)
        return true;
    }
});

// Saved custom head markup and scripts are disabled in the privacy build.

//ttyd
if (!localStorage.getItem('ttyd_port')) {
    localStorage.setItem('ttyd_port', 1146)
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => {
            console.log('Service Worker 注册成功:', reg);
        })
        .catch(err => {
            console.error('Service Worker 注册失败:', err);
        });
}

const overlay = document.createElement('div')
overlay.className = 'loading-overlay'
overlay.innerHTML = "<p>Loading...</p>"
document.body.appendChild(overlay)

//判断一下是否需要token
const needToken = async (shouldThrowError = false, fetchMaxRetries = 3) => {
    let retries = 0
    let res = null

    while (retries < fetchMaxRetries) {
        try {
            res = await (await fetchWithTimeout(`${KANO_baseURL}/need_token`, { headers: { ...common_headers } }, 1000)).json()
            if (res) {
                break
            }
        } catch {
            if (overlay) {
                overlay.innerHTML = `<p>${t('backend_not_respond')}, ${t('toast_retries')} ${retries + 1} ...</p>`
            }
        } finally {
            retries++
        }
    }

    if (!res) {
        if (shouldThrowError) {
            throw new Error(t('toast_connect_failed') + `, ${t('toast_retries')}：${retries}`)
        }
        isNeedToken = true
    } else {
        if (res.need_token) {
            isNeedToken = true
        } else {
            isNeedToken = false
        }
    }

    let tkInput = document.querySelector('#TOKEN')
    let tkLabel = document.querySelector("#TOKEN_LABEL")
    if (isNeedToken) {
        tkInput && (tkInput.style.display = "")
        tkLabel && (tkLabel.style.display = "")
    } else {
        tkInput && (tkInput.style.display = "none")
        tkLabel && (tkLabel.style.display = "none")
    }
};

needToken(true, 30).then(() => {
    overlay && (overlay.style.opacity = '0')
    setTimeout(() => {
        let container = document.querySelector('.container')
        container.style.opacity = 1
        container.style.filter = 'none'
        overlay && overlay.remove()
    }, 100);
    main_func()
}).catch((e) => {
    if (overlay) {
        overlay.innerHTML = `
        <p>${e.message}</p>
        <div><button onclick="location.reload()">${t('common_refresh_btn')}</button></div>
        `
    }
})

function main_func() {

    checkBroswer()

    //读取展示列表
    const _stor = localStorage.getItem('showList')
    const showList = _stor != null ? JSON.parse(_stor) : {
        statusShowList: [
            {
                "name": "QORS_MESSAGE",
                "isShow": true
            },
            {
                "name": "network_type",
                "isShow": true
            },
            {
                "name": "wifi_access_sta_num",
                "isShow": true
            },
            {
                "name": "battery",
                "isShow": true
            },
            {
                "name": "rssi",
                "isShow": true
            },
            {
                "name": "cpu_temp",
                "isShow": true
            },
            {
                "name": "cpu_usage",
                "isShow": true
            },
            {
                "name": "mem_usage",
                "isShow": true
            },
            {
                "name": "realtime_time",
                "isShow": true
            },
            {
                "name": "monthly_tx_bytes",
                "isShow": true
            },
            {
                "name": "daily_data",
                "isShow": true
            },
            {
                "name": "current_now",
                "isShow": true
            },
            {
                "name": "voltage_now",
                "isShow": true
            },
            {
                "name": "realtime_rx_thrpt",
                "isShow": true
            }
        ],
        signalShowList: [
            {
                "name": "Z5g_rsrp",
                "isShow": true
            },
            {
                "name": "Nr_snr",
                "isShow": true
            },
            {
                "name": "nr_rsrq",
                "isShow": true
            },
            {
                "name": "Nr_bands",
                "isShow": true
            },
            {
                "name": "Nr_fcn",
                "isShow": true
            },
            {
                "name": "Nr_bands_widths",
                "isShow": true
            },
            {
                "name": "Nr_pci",
                "isShow": true
            },
            {
                "name": "nr_rssi",
                "isShow": true
            },
            {
                "name": "Nr_cell_id",
                "isShow": true
            },
            {
                "name": "lte_rsrp",
                "isShow": true
            },
            {
                "name": "Lte_snr",
                "isShow": true
            },
            {
                "name": "lte_rsrq",
                "isShow": true
            },
            {
                "name": "Lte_bands",
                "isShow": true
            },
            {
                "name": "Lte_fcn",
                "isShow": true
            },
            {
                "name": "Lte_bands_widths",
                "isShow": true
            },
            {
                "name": "Lte_pci",
                "isShow": true
            },
            {
                "name": "lte_rssi",
                "isShow": true
            },
            {
                "name": "Lte_cell_id",
                "isShow": true
            }],
        propsShowList: [
            {
                "name": "boot_time",
                "isShow": true
            },
            {
                "name": "client_ip",
                "isShow": true
            },
            {
                "name": "model",
                "isShow": true
            },
            {
                "name": "cr_version",
                "isShow": true
            },
            {
                "name": "iccid",
                "isShow": true
            },
            {
                "name": "imei",
                "isShow": true
            },
            {
                "name": "imsi",
                "isShow": true
            },
            {
                "name": "ipv6_wan_ipaddr",
                "isShow": true
            },
            {
                "name": "lan_ipaddr",
                "isShow": true
            },
            {
                "name": "mac_address",
                "isShow": true
            },
            {
                "name": "msisdn",
                "isShow": true
            },
            {
                "name": "internal_available_storage",
                "isShow": true
            },
            {
                "name": "external_available_storage",
                "isShow": true
            },
        ]

    }

    // #拖动管理 list为当前最新正确顺序
    const saveDragListData = (list, callback) => {
        //拖动状态更改
        const children = Array.from(list.querySelectorAll('input'))
        let id = null
        if (list.id == 'draggable_status') id = 'statusShowList'
        if (list.id == 'draggable_signal') id = 'signalShowList'
        if (list.id == 'draggable_props') id = 'propsShowList'
        if (!id) return
        //遍历
        showList[id] = children.map((item) => ({
            name: item.dataset.name,
            isShow: item.checked
        }))
        localStorage.setItem('showList', JSON.stringify(showList))
        //保存
        callback && callback(list)
    }

    //初始化drag触发器
    DragList("#draggable_status", (list) => saveDragListData(list, (d_list) => {
        localStorage.setItem('statusShowListDOM', d_list.innerHTML)
    }))
    DragList("#draggable_signal", (list) => saveDragListData(list, (d_list) => {
        localStorage.setItem('signalShowListDOM', d_list.innerHTML)
    }))
    DragList("#draggable_props", (list) => saveDragListData(list, (d_list) => {
        localStorage.setItem('propsShowListDOM', d_list.innerHTML)
    }))

    //渲染listDOM
    const listDOM_STATUS = document.querySelector("#draggable_status")
    const listDOM_SIGNAL = document.querySelector("#draggable_signal")
    const listDOM_PROPS = document.querySelector("#draggable_props")
    const statusDOMStor = localStorage.getItem('statusShowListDOM')
    const signalDOMStor = localStorage.getItem('signalShowListDOM')
    const propsDOMStor = localStorage.getItem('propsShowListDOM')
    statusDOMStor && (listDOM_STATUS.innerHTML = statusDOMStor)
    signalDOMStor && (listDOM_SIGNAL.innerHTML = signalDOMStor)
    propsDOMStor && (listDOM_PROPS.innerHTML = propsDOMStor)

    //按照showList初始化排序模态框
    listDOM_STATUS.querySelectorAll('input').forEach((item) => {
        let name = item.dataset.name
        let foundItem = showList.statusShowList.find(i => i.name == name)
        if (foundItem) {
            item.checked = foundItem.isShow
        }
    })
    listDOM_SIGNAL.querySelectorAll('input').forEach((item) => {
        let name = item.dataset.name
        let foundItem = showList.signalShowList.find(i => i.name == name)
        if (foundItem) {
            item.checked = foundItem.isShow
        }
    })
    listDOM_PROPS.querySelectorAll('input').forEach((item) => {
        let name = item.dataset.name
        let foundItem = showList.propsShowList.find(i => i.name == name)
        if (foundItem) {
            item.checked = foundItem.isShow
        }
    })

    const isNullOrUndefiend = (obj) => {
        let isNumber = typeof obj === 'number'
        if (isNumber) {
            //如果是数字类型，直接返回
            return true
        }
        return obj != undefined || obj != null
    }

    let isIncludeInShowList = (dicName) => (
        showList.statusShowList.find(i => i.name == dicName)
        || showList.propsShowList.find(i => i.name == dicName)
        || showList.signalShowList.find(i => i.name == dicName)
    )

    function notNullOrundefinedOrIsShow(obj, dicName, flag = false) {
        let isNumber = typeof obj[dicName] === 'number'
        if (isNumber) {
            return isIncludeInShowList(dicName) || flag
        }
        let isReadable = obj[dicName] != null && obj[dicName] != undefined && obj[dicName] != ''
        //这里需要遍历一下是否显示的字段
        return isReadable && isIncludeInShowList(dicName)
    }

    const disabledPrivacyFeature = (event) => {
        event?.preventDefault?.()
        createToast(t('privacy_disabled_features'))
        return false
    }
    const disablePrivacyFeatureButton = (selector) => {
        const btn = document.querySelector(selector)
        if (!btn) return
        btn.disabled = true
        btn.onclick = null
        btn.title = t('privacy_disabled_features')
        btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
    }

    //初始化所有按钮
    const initRenderMethod = async () => {
        initScheduledTask()
        initPluginSetting()
        initTheme();
        initBGBtn()
        initLANSettings()
        initSmsForwardModal()
        initChangePassData()
        initChangeTokenData()
        adbQuery()
        loadTitle()
        initUpdateSoftware()
        handlerADBStatus()
        handlerADBNetworkStatus()
        handlerPerformaceStatus()
        initNetworktype()
        initSMBStatus()
        initROAMStatus()
        initSimCardType()
        initLightStatus()
        initBandForm()
        initUSBNetworkType()
        initNFCSwitch()
        initWIFISwitch()
        socatAlive()
        rebootDeviceBtnInit()
        handlerCecullarStatus()
        initScheduleRebootStatus()
        initShutdownBtn()
        initATBtn()
        initAPNManagement()
        initCellularSpeedTestBtn()
        initUSBStatusManagementBtn()
        initSleepTime()
        initAdvanceTools()
        QOSRDPCommand("AT+CGEQOSRDP=1")
        initCheckWeakToken()
        initTTYD()
    }

    let toastTimer = null
    const onTokenConfirm = debounce(async () => {
        const createTimer = () => setTimeout(() => {
            createToast(t('toast_logining'), 'pink')
        }, 2000)
        // psw_fail_num_str
        try {
            // 检测登录方法
            const login_method = document.querySelector('#login_method')
            if (login_method) {
                loginMethod = login_method.value == '1' ? "1" : "0"
                //持久化
                localStorage.setItem('login_method', loginMethod)
            }
            toastTimer && clearTimeout(toastTimer)
            createToast(t('toast_login_checking'), '', 2000)
            toastTimer = createTimer()
            await needToken()
            toastTimer && clearTimeout(toastTimer)
            let tokenInput = document.querySelector('#TOKEN')
            let pwdInput = document.querySelector('#PWDINPUT')
            let token = tokenInput && (tokenInput.value)
            let password = pwdInput && (pwdInput.value)
            if (!password || !password?.trim()) return createToast(t('toast_please_input_pwd'), 'red')
            KANO_PASSWORD = password.trim()
            if (isNeedToken) {
                if (!token || !token?.trim()) return createToast(t('toast_please_input_token'), 'red')
            }
            KANO_TOKEN = SHA256(token.trim()).toLowerCase()
            common_headers.authorization = KANO_TOKEN

            const data = new URLSearchParams({
                cmd: 'psw_fail_num_str,login_lock_time'
            })
            data.append('isTest', 'false')
            data.append('_', Date.now())
            toastTimer = createTimer()
            const res = await fetchWithTimeout(KANO_baseURL + "/goform/goform_get_cmd_process?" + data.toString(), {
                method: "GET",
                headers: {
                    ...common_headers,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }, 3000)
            toastTimer && clearTimeout(toastTimer)

            if (res.status != 200) {
                if (res.status == 401) {
                    return createToast(t('toast_token_failed'), 'red')
                }
                throw new Error(res.status + "：" + t('toast_login_failed_catch'), 'red')
            }

            toastTimer = createTimer()
            let { psw_fail_num_str, login_lock_time } = await res.json()
            toastTimer && clearTimeout(toastTimer)

            if (psw_fail_num_str == '0' && login_lock_time != '0') {
                createToast(`${t('toast_pwd_failed_limit')}${login_lock_time}S`, 'red')
                out()
                toastTimer = createTimer()
                await needToken()
                toastTimer && clearTimeout(toastTimer)
                return null
            }
            const cookie = await login()
            toastTimer && clearTimeout(toastTimer)
            if (!cookie) {
                createToast(t('toast_pwd_failed') + (psw_fail_num_str != undefined ? ` ${t('toast_pwd_failed_count')}：${psw_fail_num_str}` : ''), 'red')
                out()
                toastTimer = createTimer()
                await needToken()
                toastTimer && clearTimeout(toastTimer)
                return null
            }
            //更新后端ADMIN_PWD字段
            const update_res = await updateAdminPsw(password.trim())
            if (!update_res || update_res.result != 'success') {
                console.error('Update admin password failed:', update_res ? update_res.message : 'No response');
            }
            createToast(t('toast_login_success'), 'green')
            localStorage.setItem('kano_sms_pwd', password.trim())
            localStorage.setItem('kano_sms_token', SHA256(token.trim()).toLowerCase())
            closeModal('#tokenModal')
            initRenderMethod()
            //记住密码
            const loginRememberMe = document.querySelector('#loginRememberMe')
            if (loginRememberMe && loginRememberMe.checked) {
                //AES加密存储密码
                if (CryptoJS) {
                    const payload = CryptoJS.AES.encrypt(`${password.trim()}<kano_CryptoJS_split>${token.trim()}`, 'kano_secret_key_1145141919810721')
                    localStorage.setItem('kano_remembered_loginfo', payload)
                }
            } else if (loginRememberMe && !loginRememberMe.checked) {
                localStorage.removeItem('kano_remembered_loginfo')
            }
        }
        catch (e) {
            toastTimer && clearTimeout(toastTimer)
            createToast(t('toast_login_failed_catch'), 'red')
        }
    }, 200)

    let timer_out = null
    function out() {
        smsSender && smsSender()
        localStorage.removeItem('kano_sms_pwd')
        localStorage.removeItem('kano_sms_token')
        closeModal('#smsList')
        clearTimeout(timer_out)
        timer_out = setTimeout(() => {
            showModal('#tokenModal')
        }, 320);
    }

    let initRequestData = async () => {
        const PWD = localStorage.getItem('kano_sms_pwd')
        const TOKEN = localStorage.getItem('kano_sms_token')
        if (!PWD) {
            return false
        }
        if (isNeedToken && !TOKEN) {
            return false
        }
        KANO_TOKEN = TOKEN
        common_headers.authorization = KANO_TOKEN
        KANO_PASSWORD = PWD
        return true
    }

    let getSms = async () => {
        if (!(await initRequestData())) {
            out()
            return null
        }
        try {
            let res = await getSmsInfo()
            if (!res) {
                // out()
                createToast(t('client_mgmt_fetch_error') + res.error, 'red')
                return null
            }
            return res.messages ? res.messages : []
        } catch {
            // out()
            createToast(t('client_mgmt_fetch_error') + res.error, 'red')
            return null
        }
    }

    let isDisabledSendSMS = false
    let sendSMS = async () => {
        const SMSInput = document.querySelector('#SMSInput')
        const PhoneInput = document.querySelector('#PhoneInput')
        if (SMSInput && SMSInput.value && SMSInput.value.trim()
            && PhoneInput && PhoneInput.value && Number(PhoneInput.value.trim())
        ) {
            try {
                if (isDisabledSendSMS) return createToast(t('toast_do_not_send_repeatly'), 'red')
                const content = SMSInput.value.trim()
                const number = PhoneInput.value.trim()
                isDisabledSendSMS = true
                const res = await sendSms_UFI({ content, number })
                if (res && res.result == 'success') {
                    SMSInput.value = ''
                    createToast(t('toast_sms_send_success'), 'green')
                    handleSmsRender()
                } else {
                    createToast((res && res.message) ? res.message : t('toast_sms_send_failed'), 'red')
                }
            } catch {
                createToast(t('toast_sms_send_failed_network'), 'red')
                // out()
            }
            isDisabledSendSMS = false
        } else {
            createToast(t('toast_sms_check_phone_and_content'), 'red')
        }
    }

    const deleteState = new Map();
    const deleteSMS = async (id, flag = false) => {
        const message = document.querySelector(`#message${id}`);
        if (!message) return;
        // 获取当前 id 的删除状态
        let state = deleteState.get(id) || { confirmCount: 0, timer: null, isDeleting: false };

        if (state.isDeleting) return; // 正在删除时禁止操作

        state.confirmCount += 1;
        if (!flag) {
            message.style.display = '';
        }
        // 清除之前的计时器，重新设置 2 秒后重置状态
        clearTimeout(state.timer);
        state.timer = setTimeout(() => {
            state.confirmCount = 0;
            message.style.display = 'none';
            deleteState.set(id, state);
        }, 2000);

        deleteState.set(id, state);

        if (!flag) {
            if (state.confirmCount < 2) return; // 第一次点击时仅提示
        }
        // 进入删除状态，防止重复点击
        state.isDeleting = true;
        deleteState.set(id, state);

        try {
            const res = await removeSmsById(id);
            if (res?.result === 'success') {
                if (!flag) {
                    try {
                        //尝试删除element
                        message.parentElement.parentElement.remove()
                    } catch { }
                    createToast(t('toast_delete_success'), 'green');
                }
                setTimeout(() => {
                    handleSmsRender();
                    state.isDeleting = false;
                }, 300)
            } else {
                createToast(res?.message || t('toast_delete_failed'), 'red');
            }
        } catch {
            createToast(t('toast_opration_failed_network'), 'red');
        }

        // 删除完成后，清理状态
        deleteState.delete(id);
    };

    let deleteAndReSendSms = async (id) => {
        await deleteSMS(id, true)
        //填充
        let smsListEl = document.querySelectorAll("#sms-list .sms-item")
        if (!smsListEl || !smsListEl.length) return
        let smsList = Array.from(smsListEl)
        for (let i in smsList) {
            if (smsList[i].dataset.smsId == id) {
                const PhoneInput = document.querySelector('#PhoneInput')
                const SMSInput = document.querySelector('#SMSInput')
                if (PhoneInput && SMSInput) {
                    PhoneInput.value = smsList[i].dataset.smsPhone
                    SMSInput.value = decodeBase64(smsList[i].dataset.smsContent)
                    await sendSMS()
                }
                break
            }
        }
    }

    let isFirstRender = true
    let lastRequestSmsIds = null
    let cachedSmsRes = null
    let handleSmsRender = async () => {
        let list = document.querySelector('#sms-list')
        if (!list) createToast(t('toast_sms_list_node_not_found'), 'red')
        if (isFirstRender) {
            list.innerHTML = ` <li><h2 style="padding: 30px;text-align:center;height:100vh">Loading...</h2></li>`
        }
        showModal('#smsList')
        let res = null
        try {
            res = await getSms()
        } catch (e) {
            res = null
        }
        if (res && (res.length > 0)) {
            cachedSmsRes = safeClone(res)
        } else {
            if (isFirstRender == true) {
                return
            }
            res = cachedSmsRes
        }
        if (res && (res.length > 0)) {
            //防止重复渲染
            let ids = res.map(item => item.id).join('')
            if (ids === lastRequestSmsIds) return
            lastRequestSmsIds = ids
            const dateStrArr = [t('year'), t('month'), '&nbsp;', ':', ':', '']
            res.sort((a, b) => {
                let date_a = a.date.split(',')
                let date_b = b.date.split(',')
                date_a.pop()
                date_b.pop()
                return Number(date_b.join('')) - Number(date_a.join(''))
            })
            // 收集所有id，已读操作
            const allIds = res?.filter(item => item.tag == '1')?.map(item => item.id)
            if (allIds && allIds.length > 0) {
                try {
                    console.log(allIds, '批量已读短信');
                    readSmsByIds(allIds)
                } catch (error) {
                    console.log('批量已读短信失败', error);
                }
            }
            list.innerHTML = res.map(item => {
                let date = item.date.split(',')
                date.pop()
                date = date.map((item, index) => {
                    return item + dateStrArr[index]
                }).join('')
                const contentEl = document.createElement('p')
                contentEl.innerText = escapeHtml(decodeBase64(item.content))
                return `<li class="sms-item" data-sms-id="${item.id}" data-sms-phone="${item.number}" data-sms-content="${item.content}" style="${item.tag == '3' ? 'background-color:#ffc0cb1f;margin-right:15px' : item.tag != '2' ? 'background-color:#0880001f;margin-left:15px' : 'background-color:#ffc0cb1f;margin-right:15px'}">
                                        <div class="arrow" style="${item.tag == '3' ? 'right:-30px;border-color: transparent transparent transparent #ffc0cb1f' : item.tag == '2' ? 'right:-30px;border-color: transparent transparent transparent #ffc0cb1f' : 'left:-30px;border-color: transparent #0880001f transparent transparent'}"></div>
                                        ${item.tag == "3" ? `<svg fill="var(--dark-text-color)" stroke="currentColor"  onclick="deleteAndReSendSms(${item.id})" class="icon" style="position: absolute;right: 50px;top: 18px;" width="14px" height="14px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M815.36 184.96V128a36.48 36.48 0 0 1 10.24-26.88 37.76 37.76 0 0 1 52.48 0 40.96 40.96 0 0 1 11.52 26.88v172.16a40.32 40.32 0 0 1-37.12 37.12h-173.44a40.32 40.32 0 0 1-26.88-11.52 37.76 37.76 0 0 1 0-52.48 35.84 35.84 0 0 1 26.88-10.24h108.8a372.48 372.48 0 0 0-453.12-75.52A367.36 367.36 0 0 0 170.24 364.8a374.4 374.4 0 0 0-19.84 242.56 369.92 369.92 0 0 0 132.48 202.24A375.04 375.04 0 0 0 512 888.32a368.64 368.64 0 0 0 263.68-108.8A376.32 376.32 0 0 0 885.12 512H960A448 448 0 1 1 136.32 270.08a438.4 438.4 0 0 1 192-164.48 444.16 444.16 0 0 1 256-32 455.68 455.68 0 0 1 230.4 111.36z"></path>
            </svg>`: ""}
                                        <div class="icon" onclick="deleteSMS(${item.id})">
                                            <span id="message${item.id}" style="color: red;position: absolute;width: 100px;top: 2px;right: 30px;background: var(--dark-tag-color-active);display: none;text-align: center;padding: 4px;border-radius: 8px;backdrop-filter: blur(var(--blur-rate));">确定要删除吗？</span>
                                            <svg fill="var(--dark-text-color)" stroke="currentColor"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" t="1742373390977" class="icon" viewBox="0 0 1024 1024" version="1.1" p-id="2837" width="16" height="16"><path d="M848 144H608V96a48 48 0 0 0-48-48h-96a48 48 0 0 0-48 48v48H176a48 48 0 0 0-48 48v48h768v-48a48 48 0 0 0-48-48zM176 928a48 48 0 0 0 48 48h576a48 48 0 0 0 48-48V288H176v640z m480-496a48 48 0 1 1 96 0v400a48 48 0 1 1-96 0V432z m-192 0a48 48 0 1 1 96 0v400a48 48 0 1 1-96 0V432z m-192 0a48 48 0 1 1 96 0v400a48 48 0 1 1-96 0V432z" p-id="2838"/></svg>
                                        </div>
                                        <p style="color:#adadad;font-size:16px;margin:4px 0">${item.number}${item.tag == '3' ? ` <span style="font-size:.7rem;color:red">(${t("toast_sms_send_failed")})</span>` : ""}</p>
                                        <p>${contentEl.innerText}</p>
                                        <p style="text-align:right;color:#adadad;margin-top:4px">${date}</p>
                                    </li > `
            }).join('')
        } else {
            if (!res) {
                return createToast(t('client_mgmt_fetch_error'), 'red')
                // out()
            }
            list.innerHTML = ` <li> <h2 style="padding: 30px;text-align:center;">${t('no_sms')}</h2></li >`
        }
        isFirstRender = false
    }

    let cachedDiagImeiQueryResult = ''
    let diagImeiTimer = null
    const queryImeiFromDIAG = async () => {
        if (diagImeiTimer == null) {
            diagImeiTimer = setTimeout(() => {
                cachedDiagImeiQueryResult = ''
                diagImeiTimer = null
            }, 5 * 60 * 1000);
        }
        if (cachedDiagImeiQueryResult && cachedDiagImeiQueryResult != '') {
            return cachedDiagImeiQueryResult
        }
        let isEnabled = await checkAdvancedFunc()
        if (isEnabled) {
            try {
                const res = await runShellWithRoot(`/data/data/com.minikano.f50_sms/files/imei_reader`)
                const imei = res.content.replace(/IMEI[0-9]:/g, "").split('\n')[0]
                cachedDiagImeiQueryResult = imei
                return imei
            } catch {
                return ''
            }
        }
    }

    const resetDiagImeiCache = () => {
        cachedDiagImeiQueryResult = ''
        diagImeiTimer && clearTimeout(diagImeiTimer)
        diagImeiTimer = null
    }

    let StopStatusRenderTimer = null
    let isNotLoginOnce = true
    let status_login_try_times = 0
    let data_limit_toast_shown = false
    let handlerStatusRender = async (flag = false) => {
        const status = document.querySelector('#STATUS')
        if (flag) {
            const TOKEN = localStorage.getItem('kano_sms_token')
            if (!TOKEN && isNeedToken) {
                return false
            }
            KANO_TOKEN = TOKEN
            common_headers.authorization = KANO_TOKEN
            status.innerHTML = `
        <li style="padding-top: 15px;">
            <strong class="green" style="margin: 10px auto;margin-top: 0; display: flex;flex-direction: column;padding: 40px;">
                <span style="font-size: 50px;" class="spin">🌀</span>
                <span style="font-size: 16px;padding-top: 10px;">loading...</span>
            </strong>
        </li>`
        }
        let res = await getUFIData()
        if (!res) {
            // out()
            if (flag) {
                status.innerHTML = `<li style="padding-top: 15px;"><strong onclick="copyText(event)" class="green">${t('status_load_failed')}</strong></li>`
                createToast(t('toast_get_data_failed_check_network_pwd'), 'red')
            }
            if ((!KANO_TOKEN || !common_headers.authorization) && isNotLoginOnce) {
                status.innerHTML = `<li style="padding-top: 15px;"><strong onclick="copyText(event)" class="green">${t('status_load_failed')}</strong></li>`
                createToast(t('toast_login_to_get_data'), 'pink')
                isNotLoginOnce = false
            }
            return
        }
        if (res) {
            if (res.is_reached_data_flow_limit && !data_limit_toast_shown) {
                createToast(t("data_flow_limit_reached", "pink", 8000))
                data_limit_toast_shown = true
            }
            //需要一直保持登录
            if (res.loginfo && res.loginfo != 'ok') {
                try {
                    if (await initRequestData()) {
                        console.log('Login timeout keep login...');
                        //清除diag imei的缓存
                        resetDiagImeiCache()
                        const res = await login()
                        if (res === null) {
                            console.log('Login faild, try again...');
                            status_login_try_times += 1
                        }
                        if (res) {
                            initRenderMethod()
                        }
                        if (status_login_try_times >= 3) {
                            createToast(t('toast_login_expired'), 'red')
                            out()
                            isFirstRender = true
                            lastRequestSmsIds = null
                            localStorage.removeItem('kano_sms_pwd')
                            localStorage.removeItem('kano_sms_token')
                            KANO_TOKEN = null
                            common_headers.authorization = null
                            initRenderMethod()
                            status_login_try_times = 0
                            return
                        }
                        //立即重新执行函数
                        handlerStatusRender()
                        if (typeof StopStatusRenderTimer == 'function') {
                            StopStatusRenderTimer()
                            StopStatusRenderTimer = requestInterval(() => handlerStatusRender(), REFRESH_TIME)
                        }
                        return //跳过本次渲染
                    }
                } catch (e) {
                    console.error("handlerStatusRender retry error:", e)
                }
            }

            //如果打开了高级功能，且用户已经处于改串后不显串状态，则使用强力查串补充串号显示
            if (!res.imei || res.imei.length === 0) {
                res.imei = await queryImeiFromDIAG()
            }
            //如果设备显串，且和缓存不一致，则清空缓存
            if (res.imei && (res.imei != cachedDiagImeiQueryResult)) {
                resetDiagImeiCache()
            }
            //不管设备是否显串，只要iccid有变更，就清空imei缓存
            if (window.UFI_DATA["iccid"] !== res.iccid) {
                resetDiagImeiCache()
            }

            Object.keys(res).forEach(key => {
                window.UFI_DATA[key] = res[key];
            });
            adbQuery()
            isNotLoginOnce = false
            let html = ''
            try {
                const current_cell = document.querySelector('#CURRENT_CELL')
                const select_current_cell_btn = document.querySelector('#SELECT_CURRENT_CELL_BTN')

                const PCI = notNullOrundefinedOrIsShow(res, 'Nr_pci') ? res.Nr_pci : (notNullOrundefinedOrIsShow(res, 'Lte_pci') ? res.Lte_pci : '')
                const FCN = notNullOrundefinedOrIsShow(res, 'Nr_fcn') ? res.Nr_fcn : (notNullOrundefinedOrIsShow(res, 'Lte_fcn') ? res.Lte_fcn : '')
                const BAND_STR = notNullOrundefinedOrIsShow(res, 'Nr_bands') ? "N" + res.Nr_bands : (notNullOrundefinedOrIsShow(res, 'Lte_bands') ? "B" + res.Lte_bands : '')
                const RSRP = notNullOrundefinedOrIsShow(res, 'Z5g_rsrp') ? res.Z5g_rsrp : (notNullOrundefinedOrIsShow(res, 'lte_rsrp') ? res.lte_rsrp : '')
                const SINR = notNullOrundefinedOrIsShow(res, 'Nr_snr') ? res.Nr_snr : (notNullOrundefinedOrIsShow(res, 'Lte_snr') ? res.Lte_snr : '')
                const RSRQ = notNullOrundefinedOrIsShow(res, 'nr_rsrq') ? res.nr_rsrq : (notNullOrundefinedOrIsShow(res, 'lte_rsrq') ? res.lte_rsrq : '')

                if (!PCI || !FCN) {
                    if (current_cell) {
                        current_cell.innerHTML = `<tr><td colspan="6" style="opacity:.66;text-align:center;color:var(--dark-text-color)">${t('no_cell_connected')}</td></tr>`
                    }
                    if (select_current_cell_btn) {
                        select_current_cell_btn.onclick = () => {
                            createToast(t('no_cell_connected'), 'pink')
                        }
                    }
                }

                if (select_current_cell_btn) {
                    select_current_cell_btn.onclick = () => onSelectCellRow(PCI, FCN)
                }

                if (current_cell) {
                    current_cell.innerHTML = `
            <tr onclick="onSelectCellRow(${PCI},${FCN})" style="cursor: pointer;">
                <td>${BAND_STR}</td>
                <td>${FCN}</td>
                <td>${PCI}</td>
                <td>${kano_parseSignalBar(RSRP)}</td>
                <td>${kano_parseSignalBar(SINR, -10, 30, 13, 0)}</td>
                <td>${kano_parseSignalBar(RSRQ, -20, -3, -9, -12)}</td>
            </tr>
            `
                }
            } catch (e) {
                console.error("render PCI blocks fail:", e);
            }

            try {
                if (QORS_MESSAGE) {
                    res['QORS_MESSAGE'] = QORS_MESSAGE
                }
                const unreadEl = document.querySelector('#UNREAD_SMS')
                if (res.sms_unread_num && res.sms_unread_num > 0) {
                    unreadEl.style.display = ''
                    unreadEl.innerHTML = res.sms_unread_num > 99 ? '99+' : res.sms_unread_num
                } else {
                    unreadEl.innerHTML = ''
                    unreadEl.style.display = 'none'
                }
            } catch { }

            let statusHtml_base = {
                QORS_MESSAGE: `${notNullOrundefinedOrIsShow(res, "QORS_MESSAGE") ? `<strong onclick="copyText(event)"  class="green">${QORS_MESSAGE}</strong>` : ''}`,
                network_type: `${notNullOrundefinedOrIsShow(res, 'network_type') ? `<strong onclick="copyText(event)"  class="green">${t('network_status')}：${res.network_provider} ${res.network_type == '20' ? '5G' : res.network_type == '13' ? '4G' : res.network_type}</strong>` : ''}`,
                wifi_access_sta_num: `${notNullOrundefinedOrIsShow(res, 'wifi_access_sta_num') ? `<strong onclick="copyText(event)"  class="blue">${t('wifi_client_num')}：${res.wifi_access_sta_num}</strong>` : ''}`,
                battery: `${notNullOrundefinedOrIsShow(res, 'battery') && (res.battery_value != '' || res.battery_vol_percent != '') ? `<strong onclick="copyText(event)"  class="green">${res.battery_charging == "1" ? `${t('charging')}` : `${t('battery_level')}`}：${kano_parseSignalBar(res.battery, 1, 100, 50, 10, undefined, " %")}</strong>` : ''}`,
                rssi: `${notNullOrundefinedOrIsShow(res, 'rssi') || notNullOrundefinedOrIsShow(res, 'network_signalbar', true) ? `<strong onclick="copyText(event)"  class="green">${t('rssi')}：${kano_getSignalEmoji(notNullOrundefinedOrIsShow(res, 'rssi') ? res.rssi : res.network_signalbar)}</strong>` : ''}`,
                cpu_temp: `${notNullOrundefinedOrIsShow(res, 'cpu_temp') ? `<strong onclick="copyText(event)"  class="blue">${t('cpu_temp')}：<span style="text-align:center;display:inline-block;width: 8ch;">${String(Number(res.cpu_temp / 1000).toFixed(2)).padStart(5, ' ')} ℃</span></strong>` : ''}`,
                cpu_usage: `${notNullOrundefinedOrIsShow(res, 'cpu_usage') ? `<strong onclick="copyText(event)"  class="blue">${t('cpu_usage')}：<span style="text-align:center;display:inline-block;width: 8ch;">${String(Number(res.cpu_usage).toFixed(2)).padStart(5, ' ')} %</span></strong>` : ''}`,
                mem_usage: `${notNullOrundefinedOrIsShow(res, 'mem_usage') ? `<strong onclick="copyText(event)"  class="blue">${t("ram_usage")}：<span style="text-align:center;display:inline-block;width: 8ch;">${String(Number(res.mem_usage).toFixed(2)).padStart(5, ' ')} %</span></strong>` : ''}`,
                realtime_time: `${notNullOrundefinedOrIsShow(res, 'realtime_time') ? `<strong onclick="copyText(event)"  class="blue">${t('link_realtime')}：${kano_formatTime(Number(res.realtime_time))}${res.monthly_time ? `&nbsp;<span style="color:white">/</span>&nbsp;${t('total_link_time')}: ` + kano_formatTime(Number(res.monthly_time)) : ''}</strong>` : ''}`,
                monthly_tx_bytes: `${notNullOrundefinedOrIsShow(res, 'monthly_tx_bytes') || notNullOrundefinedOrIsShow(res, 'monthly_rx_bytes') ? `<strong onclick="copyText(event)"  class="blue">${t("monthly_rx_bytes")}：<span class="red">${formatBytes(Number((res.monthly_tx_bytes + res.monthly_rx_bytes)))}</span>${(res.data_volume_limit_size || res.flux_data_volume_limit_size) && (res.flux_data_volume_limit_switch == '1' || res.data_volume_limit_switch == '1') ? `&nbsp;<span style="color:white">/</span>&nbsp;${t('total_limit_bytes')}：` + formatBytes((() => {
                    const limit_size = res.data_volume_limit_size ? res.data_volume_limit_size : res.flux_data_volume_limit_size
                    if (!limit_size) return ''
                    return limit_size.split('_')[0] * limit_size.split('_')[1] * Math.pow(1024, 2)
                })()) : ''}</strong>` : ''}`,
                daily_data: `${notNullOrundefinedOrIsShow(res, 'daily_data') ? `<strong onclick="copyText(event)"  class="blue">${t('daily_data')}：${formatBytes(res.daily_data)}${res.monthly_data ? ` / ${t('monthly_data')}：${formatBytes(res.monthly_data)}` : ''}</strong>` : ''}`,
                current_now: `${notNullOrundefinedOrIsShow(res, 'current_now') && (res.battery_value != '' || res.battery_vol_percent != '') ? `<strong onclick="copyText(event)"  class="blue">${t('battery_current')}：<span style="width: 9ch;text-align:center">${res.current_now / 1000} mA</span></strong>` : ''}`,
                voltage_now: `${notNullOrundefinedOrIsShow(res, 'voltage_now') && (res.battery_value != '' || res.battery_vol_percent != '') ? `<strong onclick="copyText(event)"  class="blue">${t('battery_voltage')}：${(res.voltage_now / 1000000).toFixed(3)} V</strong>` : ''}`,
                realtime_rx_thrpt: `${notNullOrundefinedOrIsShow(res, 'realtime_tx_thrpt') || notNullOrundefinedOrIsShow(res, 'realtime_rx_thrpt') ? `<strong onclick="copyText(event)" class="blue">${t("current_network_speed")}: <span style="text-align:center;white-space:nowrap;overflow:hidden;display:inline-block;width: 14ch;">⬇️&nbsp;${formatBytes(Number((res.realtime_rx_thrpt)))}/S</span><span style="white-space:nowrap;overflow:hidden;text-align:center;display:inline-block;width: 14ch;font-weight:bolder">⬆️&nbsp;${formatBytes(Number((res.realtime_tx_thrpt)))}/S</span></strong>` : ''}`,
            }
            let statusHtml_net = {
                lte_rsrp: notNullOrundefinedOrIsShow(res, 'lte_rsrp') ? `<strong onclick="copyText(event)" class="green">${t('4g_rsrp')}：${kano_parseSignalBar(res.lte_rsrp)}</strong>` : '',
                Lte_snr: notNullOrundefinedOrIsShow(res, 'Lte_snr') ? `<strong onclick="copyText(event)" class="blue">${t('4g_sinr')}：${kano_parseSignalBar(res.Lte_snr, -10, 30, 13, 0)}</strong>` : '',
                Lte_bands: notNullOrundefinedOrIsShow(res, 'Lte_bands') ? `<strong onclick="copyText(event)" class="blue">${t('4g_band')}：B${res.Lte_bands}</strong>` : '',
                Lte_fcn: notNullOrundefinedOrIsShow(res, 'Lte_fcn') ? `<strong onclick="copyText(event)" class="green">${t('4g_freq')}：${res.Lte_fcn}</strong>` : '',
                Lte_bands_widths: notNullOrundefinedOrIsShow(res, 'Lte_bands_widths') ? `<strong onclick="copyText(event)" class="green">${t('4g_bandwidth')}：${res.Lte_bands_widths}</strong>` : '',
                Lte_pci: notNullOrundefinedOrIsShow(res, 'Lte_pci') ? `<strong onclick="copyText(event)" class="blue">${t('4g_pci')}：${res.Lte_pci}</strong>` : '',
                lte_rsrq: notNullOrundefinedOrIsShow(res, 'lte_rsrq') ? `<strong onclick="copyText(event)" class="blue">${t('4g_rsrq')}：${kano_parseSignalBar(res.lte_rsrq, -20, -3, -9, -12)}</strong>` : '',
                lte_rssi: notNullOrundefinedOrIsShow(res, 'lte_rssi') ? `<strong onclick="copyText(event)" class="green">${t('4g_rssi')}：${res.lte_rssi}</strong>` : '',
                Lte_cell_id: notNullOrundefinedOrIsShow(res, 'Lte_cell_id') ? `<strong onclick="copyText(event)" class="green">${t('4g_cell_id')}：${res.Lte_cell_id}</strong>` : '',

                Z5g_rsrp: notNullOrundefinedOrIsShow(res, 'Z5g_rsrp') ? `<strong onclick="copyText(event)" class="green">${t('5g_rsrp')}：${kano_parseSignalBar(res.Z5g_rsrp)}</strong>` : '',
                Nr_snr: notNullOrundefinedOrIsShow(res, 'Nr_snr') ? `<strong onclick="copyText(event)" class="green">${t('5g_sinr')}：${kano_parseSignalBar(res.Nr_snr, -10, 30, 13, 0)}</strong>` : '',
                Nr_bands: notNullOrundefinedOrIsShow(res, 'Nr_bands') ? `<strong onclick="copyText(event)" class="green">${t('5g_band')}：N${res.Nr_bands}</strong>` : '',
                Nr_fcn: notNullOrundefinedOrIsShow(res, 'Nr_fcn') ? `<strong onclick="copyText(event)" class="blue">${t('5g_freq')}：${res.Nr_fcn}</strong>` : '',
                Nr_bands_widths: notNullOrundefinedOrIsShow(res, 'Nr_bands_widths') ? `<strong onclick="copyText(event)" class="blue">${t('5g_bandwidth')}：${res.Nr_bands_widths}</strong>` : '',
                Nr_pci: notNullOrundefinedOrIsShow(res, 'Nr_pci') ? `<strong onclick="copyText(event)" class="green">${t('5g_pci')}：${res.Nr_pci}</strong>` : '',
                nr_rsrq: notNullOrundefinedOrIsShow(res, 'nr_rsrq') ? `<strong onclick="copyText(event)" class="green">${t('5g_rsrq')}：${kano_parseSignalBar(res.nr_rsrq, -20, -3, -9, -12)}</strong>` : '',
                nr_rssi: notNullOrundefinedOrIsShow(res, 'nr_rssi') ? `<strong onclick="copyText(event)" class="blue">${t('5g_rssi')}：${res.nr_rssi}</strong>` : '',
                Nr_cell_id: notNullOrundefinedOrIsShow(res, 'Nr_cell_id') ? `<strong onclick="copyText(event)" class="blue">${t('5g_cell_id')}：${res.Nr_cell_id}</strong>` : '',
            };

            let statusHtml_other = {
                client_ip: notNullOrundefinedOrIsShow(res, 'client_ip') ? `<strong onclick="copyText(event)" class="blue">${t('client_ip')}：${res.client_ip}</strong>` : '',
                model: notNullOrundefinedOrIsShow(res, 'model') ? `<strong onclick="copyText(event)" class="blue">${t('device_model')}：${res.model}</strong>` : '',
                cr_version: notNullOrundefinedOrIsShow(res, 'cr_version') ? `<strong onclick="copyText(event)" class="blue">${t('version')}：${res.cr_version}</strong>` : '',
                iccid: notNullOrundefinedOrIsShow(res, 'iccid') ? `<strong onclick="copyText(event)" class="blue">ICCID：${res.iccid}</strong>` : '',
                imei: notNullOrundefinedOrIsShow(res, 'imei') ? `<strong onclick="copyText(event)" class="blue">IMEI：${res.imei}</strong>` : '',
                imsi: notNullOrundefinedOrIsShow(res, 'imsi') ? `<strong onclick="copyText(event)" class="blue">IMSI：${res.imsi}</strong>` : '',
                ipv6_wan_ipaddr: notNullOrundefinedOrIsShow(res, 'ipv6_wan_ipaddr') ? `<strong onclick="copyText(event)" class="blue">${t('ipv6_addr')}：${res.ipv6_wan_ipaddr}</strong>` : '',
                lan_ipaddr: notNullOrundefinedOrIsShow(res, 'lan_ipaddr') ? `<strong onclick="copyText(event)" class="blue">${t('lan_gateway')}：${res.lan_ipaddr}</strong>` : '',
                mac_address: notNullOrundefinedOrIsShow(res, 'mac_address') ? `<strong onclick="copyText(event)" class="blue">MAC：${res.mac_address}</strong>` : '',
                msisdn: notNullOrundefinedOrIsShow(res, 'msisdn') ? `<strong onclick="copyText(event)" class="blue">${t('msisdn')}：${res.msisdn}</strong>` : '',
                internal_available_storage: (notNullOrundefinedOrIsShow(res, 'internal_available_storage') || notNullOrundefinedOrIsShow(res, 'internal_total_storage')) ? `<strong onclick="copyText(event)" class="blue">${t('internal_storage')}：${formatBytes(res.internal_used_storage)} ${t('used_storage')} / ${formatBytes(res.internal_total_storage)} ${t('total_storage')}</strong>` : '',
                external_available_storage: (notNullOrundefinedOrIsShow(res, 'external_available_storage') || notNullOrundefinedOrIsShow(res, 'external_total_storage')) ? `<strong onclick="copyText(event)" class="blue">${t('sd_storage')}：${formatBytes(res.external_used_storage)} ${t('used_storage')} / ${formatBytes(res.external_total_storage)} ${t('total_storage')}</strong>` : '',
                boot_time: notNullOrundefinedOrIsShow(res, 'boot_time') ? `<strong onclick="copyText(event)" class="blue">${t('boot_time')}：${formatBootTime(res.boot_time)}</strong>` : '',
            };

            html += `<li style="padding-top: 15px;"><p>`
            showList.statusShowList.forEach(item => {
                if (statusHtml_base[item.name] && item.isShow) {
                    html += statusHtml_base[item.name]
                }
            })
            html += `</p></li>`
            html += `<div class="title" style="margin: 6px 0;"><b>${t('signal_params')}</b></div>`

            html += `<li style="padding-top: 15px;"><p>`
            showList.signalShowList.forEach(item => {
                if (statusHtml_net[item.name] && item.isShow) {
                    html += statusHtml_net[item.name]
                }
            })
            html += `</p></li>`
            html += `<div class="title" style="margin: 6px 0;"><b>${t('device_props')}</b></div>`

            html += `<li style="padding-top: 15px;"><p>`
            showList.propsShowList.forEach(item => {
                if (statusHtml_other[item.name] && item.isShow) {
                    html += statusHtml_other[item.name]
                }
            })
            html += `</p></li>`
            status && (status.innerHTML = html)
        }
    }
    handlerStatusRender(true)
    StopStatusRenderTimer = requestInterval(() => handlerStatusRender(), REFRESH_TIME)

    //检查usb调试状态
    let handlerADBStatus = async () => {
        const btn = document.querySelector('#ADB')
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        let res = await getData(new URLSearchParams({
            cmd: 'usb_port_switch'
        }))
        btn.onclick = async () => {
            try {
                if (!(await initRequestData())) {
                    return null
                }
                const cookie = await login()
                if (!cookie) {
                    createToast(t('login_failed_check_pwd'), 'red')
                    out()
                    return null
                }
                let res1 = await (await postData(cookie, {
                    goformId: 'USB_PORT_SETTING',
                    usb_port_switch: res.usb_port_switch == '1' ? '0' : '1'
                })).json()

                if (res1.result == 'success') {
                    createToast(t('toast_oprate_success'), 'green')
                    await handlerADBStatus()
                } else {
                    createToast(t('toast_oprate_failed'), 'red')
                }
            } catch (e) {
                console.error(e.message)
            }
        }
        btn.style.backgroundColor = res.usb_port_switch == '1' ? 'var(--dark-btn-color-active)' : ''

    }
    handlerADBStatus()

    // ADB automatic activation is disabled; manual port controls remain separate.
    const handlerADBNetworkStatus = () => disablePrivacyFeatureButton('#ADB_NET')
    handlerADBNetworkStatus()

    //检查性能模式状态
    let handlerPerformaceStatus = async () => {
        const btn = document.querySelector('#PERF')
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        let res = await getData(new URLSearchParams({
            cmd: 'performance_mode'
        }))
        btn.style.backgroundColor = res.performance_mode == '1' ? 'var(--dark-btn-color-active)' : ''
        btn.onclick = async () => {
            try {
                if (!(await initRequestData())) {
                    return null
                }
                const cookie = await login()
                if (!cookie) {
                    createToast(t('toast_login_failed_check_network'), 'red')
                    out()
                    return null
                }
                let res1 = await (await postData(cookie, {
                    goformId: 'PERFORMANCE_MODE_SETTING',
                    performance_mode: res.performance_mode == '1' ? '0' : '1'
                })).json()
                if (res1.result == 'success') {
                    createToast(t('toast_oprate_success_reboot'), 'green')
                    await handlerPerformaceStatus()
                } else {
                    createToast(t('toast_oprate_failed'), 'red')
                }
            } catch (e) {
                // createToast(e.message)
            }
        }
    }
    handlerPerformaceStatus()

    async function init() {
        smsSender && smsSender()
        if (!(await initRequestData())) {
            showModal('#tokenModal')
        } else {
            isFirstRender = true
            lastRequestSmsIds = null
            handleSmsRender()
            smsSender = requestInterval(() => handleSmsRender(), 2000)
        }
    }

    // init()
    let smsBtn = document.querySelector('#SMS')
    smsBtn.onclick = init

    let clearBtn = document.querySelector('#CLEAR')
    clearBtn.onclick = async () => {
        isFirstRender = true
        lastRequestSmsIds = null
        localStorage.removeItem('kano_sms_pwd')
        localStorage.removeItem('kano_sms_token')
        KANO_TOKEN = null
        common_headers.authorization = null
        initRenderMethod()
        //退出登录请求
        try {
            login().finally(cookie => {
                logout(cookie)
            })
        } catch { }
        await needToken()
        const label = document.querySelector("#token_div_label2")
        const tokenEl = document.querySelector("#PWD_BLK")
        const pwdEl = document.querySelector("#PWDINPUT")
        const tokenInput = document.querySelector("#TOKEN")
        label.style.display = ""
        tokenEl.style.display = "flex"
        //填充密码
        if (CryptoJS) {
            const str = localStorage.getItem('kano_remembered_loginfo')
            if (str) {
                try {
                    const bytes = CryptoJS.AES.decrypt(str, 'kano_secret_key_1145141919810721')
                    const originalText = bytes.toString(CryptoJS.enc.Utf8)
                    const [remembered_password, remembered_token] = originalText.split('<kano_CryptoJS_split>')
                    if (remembered_password && remembered_token) {
                        pwdEl.value = remembered_password
                        tokenInput.value = remembered_token
                        const loginRememberMe = document.querySelector('#loginRememberMe')
                        if (loginRememberMe) {
                            loginRememberMe.checked = true
                        }
                    }
                } catch (e) {
                    console.error('Error decrypting remembered login info:', e)
                }
            }
        }
        if (pwdEl && pwdEl.value.trim() == "Wa@9w+YWRtaW4=") {
            const loginMethodEl = document.querySelector("#login_method")
            console.log("Admin login method detected, switch to password input")
            if (loginMethodEl) {
                loginMethodEl.value = "0"
            }
        }
        createToast(t('toast_logout'), 'green')
        showModal('#tokenModal')
    }

    let initNetworktype = async () => {
        const selectEl = document.querySelector('#NET_TYPE')
        if (!(await initRequestData()) || !selectEl) {
            selectEl.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            selectEl.disabled = true
            return null
        }
        selectEl.style.backgroundColor = ''
        selectEl.disabled = false
        let res = await getData(new URLSearchParams({
            cmd: 'net_select'
        }))
        if (!selectEl || !res || res.net_select == null || res.net_select == undefined) {
            return
        }

        [...selectEl.children].forEach((item) => {
            if (item.value == res.net_select) {
                item.selected = true
            }
        })
        QOSRDPCommand("AT+CGEQOSRDP=1")
        let interCount = 0
        let temp_inte = requestInterval(async () => {
            let res = await QOSRDPCommand("AT+CGEQOSRDP=1")
            if (interCount == 20) return temp_inte && temp_inte()
            if (res && !res.includes("ERROR")) {
                return temp_inte && temp_inte()
            }
            interCount++
        }, 1000);
    }
    initNetworktype()

    const changeNetwork = async (e, silent = false) => {
        const value = e.target.value.trim()
        if (!(await initRequestData()) || !value) {
            return null
        }
        !silent && createToast(t('toast_changing'), '#BF723F')
        try {
            const cookie = await login()
            if (!cookie) {
                !silent && createToast(t('login_failed_check_pwd'), 'red')
                out()
                return null
            }
            let res = await (await postData(cookie, {
                goformId: 'SET_BEARER_PREFERENCE',
                BearerPreference: value.trim()
            })).json()
            if (res.result == 'success') {
                !silent && createToast(t('toast_oprate_success'), 'green')
            } else {
                createToast(t('toast_oprate_failed'), 'red')
            }
            await initNetworktype()
        } catch (e) {
            // createToast(e.message)
        }
    }

    let initUSBNetworkType = async () => {
        const selectEl = document.querySelector('#USB_TYPE')
        if (!(await initRequestData()) || !selectEl) {
            selectEl.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            selectEl.disabled = true
            return null
        }
        selectEl.style.backgroundColor = ''
        selectEl.disabled = false
        let res = await getData(new URLSearchParams({
            cmd: 'usb_network_protocal'
        }))
        if (!selectEl || !res || res.usb_network_protocal == null || res.usb_network_protocal == undefined) {
            return
        }
        [...selectEl.children].forEach((item) => {
            if (item.value == res.usb_network_protocal) {
                item.selected = true
            }
        })
    }
    initUSBNetworkType()

    let changeUSBNetwork = async (e) => {
        const value = e.target.value.trim()
        if (!(await initRequestData()) || !value) {
            return null
        }
        createToast(t('toast_changing'), '#BF723F')
        try {
            const cookie = await login()
            if (!cookie) {
                createToast(t('toast_login_failed_check_network'), 'red')
                out()
                return null
            }
            let res = await (await postData(cookie, {
                goformId: 'SET_USB_NETWORK_PROTOCAL',
                usb_network_protocal: value.trim()
            })).json()
            if (res.result == 'success') {
                createToast(t('toast_oprate_success_reboot'), 'green')
            } else {
                createToast(t('toast_oprate_failed'), 'red')
            }
            await initUSBNetworkType()
        } catch (e) {
            // createToast(e.message)
        }
    }

    //WiFi开关切换_INIT
    let initWIFISwitch = async () => {
        const selectEl = document.querySelector('#WIFI_SWITCH')
        if (!(await initRequestData()) || !selectEl) {
            selectEl.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            selectEl.disabled = true
            return null
        }

        selectEl.style.backgroundColor = ''
        selectEl.disabled = false
        let { WiFiModuleSwitch, ResponseList } = await getData(new URLSearchParams({
            cmd: 'queryWiFiModuleSwitch,queryAccessPointInfo'
        }))

        const WIFIManagementContent = document.querySelector('#wifiInfo')

        try {
            await initWIFIManagementForm()
        } catch { }

        if (WiFiModuleSwitch == "1") {
            WIFIManagementContent && (WIFIManagementContent.style.display = '')
            if (ResponseList?.length) {
                ResponseList.forEach(item => {
                    if (item.AccessPointSwitchStatus == '1') {
                        selectEl.value = item.ChipIndex == "0" ? 'chip1' : 'chip2'
                    }
                })
            }
        } else {
            WIFIManagementContent && (WIFIManagementContent.style.display = 'none')
            selectEl.value = 0
        }
    }
    initWIFISwitch()

    //WiFi开关切换
    let changeWIFISwitch = async (e) => {
        const selectEl = document.querySelector('#WIFI_SWITCH')
        const value = e.target.value.trim()
        if (!(await initRequestData()) || !value) {
            createToast(t('toast_need_login'), 'red')
            return null
        }
        createToast(t('toast_changing'), '#BF723F')
        try {
            selectEl.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            selectEl.disabled = true
            const cookie = await login()
            if (!cookie) {
                createToast(t('toast_login_failed_check_network'), 'red')
                out()
                return null
            }
            let res = null
            if (value == "0" || value == 0) {
                res = await (await postData(cookie, {
                    goformId: 'switchWiFiModule',
                    SwitchOption: 0
                })).json()
            } else if (value == 'chip1' || value == 'chip2') {
                res = await (await postData(cookie, {
                    goformId: 'switchWiFiChip',
                    ChipEnum: value,
                    GuestEnable: 0
                })).json()
            } else {
                return
            }
            setTimeout(() => {
                if (res.result == 'success') {
                    createToast(t('toast_op_success_reconnect_wifi'), 'green')
                    initWIFISwitch()

                } else {
                    createToast(t('toast_oprate_failed'), 'red')
                }
                selectEl.style.backgroundColor = ''
                selectEl.disabled = false
            }, 1000);
        } catch (e) {
            // createToast(e.message)
        }
    }

    let initSMBStatus = async () => {
        const el = document.querySelector('#SMB')
        if (!(await initRequestData()) || !el) {
            el.onclick = () => createToast(t('toast_please_login'), 'red')
            el.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        let res = await getData(new URLSearchParams({
            cmd: 'samba_switch'
        }))
        if (!el || !res || res.samba_switch == null || res.samba_switch == undefined) return
        el.onclick = async () => {
            if (!(await initRequestData())) {
                return null
            }
            try {
                const cookie = await login()
                if (!cookie) {
                    createToast(t('toast_login_failed_check_network'), 'red')
                    out()
                    return null
                }
                let res1 = await (await postData(cookie, {
                    goformId: 'SAMBA_SETTING',
                    samba_switch: res.samba_switch == '1' ? '0' : '1'
                })).json()
                if (res1.result == 'success') {
                    createToast(t('toast_oprate_success'), 'green')
                } else {
                    createToast(t('toast_oprate_failed'), 'red')
                }
                await initSMBStatus()
            } catch (e) {
                // createToast(e.message)
            }
        }
        el.style.backgroundColor = res.samba_switch == '1' ? 'var(--dark-btn-color-active)' : ''
    }
    initSMBStatus()

    //检查网路漫游状态
    let initROAMStatus = async () => {
        const el = document.querySelector('#ROAM')
        if (!(await initRequestData()) || !el) {
            el.onclick = () => createToast(t('toast_please_login'), 'red')
            el.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        let res = await getData(new URLSearchParams({
            cmd: 'roam_setting_option,dial_roam_setting_option'
        }))
        if (res && res.dial_roam_setting_option) {
            res.roam_setting_option = res.dial_roam_setting_option
        }
        if (!el || !res || res.roam_setting_option == null || res.roam_setting_option == undefined) return
        el.onclick = async () => {
            if (!(await initRequestData())) {
                return null
            }
            try {
                const cookie = await login()
                if (!cookie) {
                    createToast(t('toast_login_failed_check_network'), 'red')
                    out()
                    return null
                }
                let res1 = await (await postData(cookie, {
                    goformId: 'SET_CONNECTION_MODE',
                    ConnectionMode: "auto_dial",
                    roam_setting_option: res.roam_setting_option == 'on' ? 'off' : 'on',
                    dial_roam_setting_option: res.roam_setting_option == 'on' ? 'off' : 'on'
                })).json()
                if (res1.result == 'success') {
                    createToast(t('toast_oprate_success'), 'green')
                } else {
                    createToast(t('toast_oprate_failed'), 'red')
                }
                await initROAMStatus()
            } catch (e) {
                // createToast(e.message)
            }
        }
        el.style.backgroundColor = res.roam_setting_option == 'on' ? 'var(--dark-btn-color-active)' : ''
    }
    initROAMStatus()

    let initLightStatus = async () => {
        const el = document.querySelector('#LIGHT')
        if (!(await initRequestData()) || !el) {
            el.onclick = () => createToast(t('toast_please_login'), 'red')
            el.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        let res = await getData(new URLSearchParams({
            cmd: 'indicator_light_switch'
        }))
        if (!el || !res || res.indicator_light_switch == null || res.indicator_light_switch == undefined) return
        el.onclick = async () => {
            if (!(await initRequestData())) {
                return null
            }
            try {
                const cookie = await login()
                if (!cookie) {
                    createToast(t('toast_login_failed_check_network'), 'red')
                    out()
                    return null
                }
                let res1 = await (await postData(cookie, {
                    goformId: 'INDICATOR_LIGHT_SETTING',
                    indicator_light_switch: res.indicator_light_switch == '1' ? '0' : '1'
                })).json()
                if (res1.result == 'success') {
                    createToast(t('toast_oprate_success'), 'green')
                } else {
                    createToast(t('toast_oprate_failed'), 'red')
                }
                await initLightStatus()
            } catch (e) {
                createToast(e.message, 'red')
            }
        }
        el.style.backgroundColor = res.indicator_light_switch == '1' ? 'var(--dark-btn-color-active)' : ''
    }
    initLightStatus()

    const DEFAULT_NR_5G_BANDS = [1, 5, 8, 28, 41, 78]

    const renderBandList = (bands, el) => {
        if (!el) return

        el.querySelectorAll('tr[data-band-type="5G"]').forEach(row => row.remove())
        const supportBands = [...new Set((Array.isArray(bands) ? bands : [])
            .map(band => Number(String(band).replace(/^n/i, '')))
            .filter(Number.isInteger)
            .filter(band => band > 0))]
            .sort((a, b) => a - b)

        supportBands.forEach(band => {
            const bandInfo = get5GBandInfo(band)
            const bandEl = document.createElement('tr')
            bandEl.dataset.bandType = '5G'
            bandEl.innerHTML = `
                <td><input type="checkbox" data-type="5G" data-band="${band}"></td>
                <td>${bandInfo.band}</td>
                <td>${bandInfo.range}</td>
                <td>${bandInfo.mode}</td>
                <td data-i18n="${bandInfo.i18nKey}">${t(bandInfo.i18nKey, bandInfo.operator)}</td>
            `
            el.appendChild(bandEl)
        })
        initBandsTrClick()
    }

    const initBandForm = async () => {
        const el = document.querySelector('#bandsForm')
        if (!(await initRequestData()) || !el) {
            return null
        }
        let res = await getData(new URLSearchParams({
            cmd: 'lte_band_lock,nr_band_lock'
        }))

        if (!res) return null

        const bandListEl = document.querySelector('#bandTable')
        if (bandListEl) {
            try {
                const atSlot = document.querySelector('#AT_SLOT')?.value?.trim()
                const slot = /^\d+$/.test(atSlot) ? atSlot : '0'
                const response = await fetchWithTimeout(
                    `${KANO_baseURL}/getSupportNrBandList?slot=${slot}`,
                    { headers: common_headers }
                )
                if (!response.ok) throw new Error(`HTTP ${response.status}`)

                const { band_list: supportBands } = await response.json()
                if (!Array.isArray(supportBands) || supportBands.length === 0) {
                    throw new Error('AT 未返回支持的 5G 频段')
                }
                renderBandList(supportBands, bandListEl)
            } catch (error) {
                console.warn('获取支持的 5G 频段列表失败：', error)
                renderBandList(DEFAULT_NR_5G_BANDS, bandListEl)
            }
        }

        document.querySelectorAll('#bandsForm input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false
        })

        if (res['lte_band_lock']) {
            const bands = res['lte_band_lock'].split(',')
            if (bands && bands.length) {
                for (let band of bands) {
                    //  data-type="4G" data-band="5"
                    const el = document.querySelector(`#bandsForm input[type="checkbox"][data-band="${band}"][data-type="4G"]`)
                    if (el) el.checked = true
                }
            }
        }
        if (res['nr_band_lock']) {
            const bands = res['nr_band_lock'].split(',')
            if (bands && bands.length) {
                for (let band of bands) {
                    //  data-type="5G" data-band="5"
                    const el = document.querySelector(`#bandsForm input[type="checkbox"][data-band="${band}"][data-type="5G"]`)
                    if (el) el.checked = true
                }
            }
        }
        checkBandSelect()
    }
    initBandForm()

    //网络协议栈开关
    const networkStackSwitch = async (flag, slot = 0) => {
        await executeATCommand(flag ? "AT+SFUN=4" : "AT+SFUN=5", slot)
    }

    const submitBandForm = async (e) => {
        e.preventDefault()
        if (!(await initRequestData())) {
            out()
            return null
        }
        let lockBandBtn = document.querySelector("#lockBandBtn")
        let unlockBandBtn = document.querySelector("#unlockBandBtn")
        if (!lockBandBtn && !unlockBandBtn) {
            console.log("找不到unlockBandBtn、lockBandBtn")
            return
        }

        setBtnLoading(lockBandBtn, true)
        setBtnLoading(unlockBandBtn, true)

        const form = e.target
        const bands = form.querySelectorAll('input[type="checkbox"]:checked')
        const lte_bands = []
        const nr_bands = []
        //收集选中的数据
        if (bands && bands.length) {
            for (let band of bands) {
                const type = band.getAttribute('data-type')
                const b = band.getAttribute('data-band')
                if (type && b) {
                    if (type == '4G') lte_bands.push(b)
                    if (type == '5G') nr_bands.push(b)
                }
            }
        }
        const cookie = await login()
        if (!cookie) {
            createToast(t('toast_login_failed_check_network'), 'red')
            out()
            setBtnLoading(lockBandBtn, false)
            setBtnLoading(unlockBandBtn, false)
            return null
        }
        try {
            const res = await (await Promise.all([
                (await postData(cookie, {
                    goformId: 'LTE_BAND_LOCK',
                    lte_band_lock: lte_bands.join(',')
                })).json(),
                (await postData(cookie, {
                    goformId: 'NR_BAND_LOCK',
                    nr_band_lock: nr_bands.join(',')
                })).json(),
            ]))
            if (res[0].result == 'success' || res[1].result == 'success') {
                createToast(t('toast_set_band_success'), 'green')
                //重启网络栈
                await networkStackSwitch(false, 0)
                await wait(100)
                await networkStackSwitch(false, 1)
                await wait(100)
                await networkStackSwitch(true, 0)
                await wait(100)
                await networkStackSwitch(true, 1)
                // const netType = document.querySelector('#NET_TYPE')
                // if (netType) {
                //     const options = document.querySelectorAll('#NET_TYPE option')
                //     const curValue = netType.value
                //     //切到不同网络
                //     if (options.length) {
                //         const net = Array.from(options).find(el => el.value != curValue)
                //         if (net) {
                //             //切网
                //             createToast(t("toast_changing"))
                //             await changeNetwork({ target: { value: net.value } }, true)
                //             await new Promise(resolve => setTimeout(resolve, 800))
                //             //切回来
                //             await changeNetwork({ target: { value: curValue } })
                //         }
                //     }
                // }
            }
            else {
                createToast(t('toast_set_band_failed'), 'red')
            }
        } catch {
            createToast(t('toast_set_band_failed'), 'red')
        } finally {
            await initBandForm()
            setBtnLoading(lockBandBtn, false)
            setBtnLoading(unlockBandBtn, false)
        }
    }

    //解除锁定所有频段
    const unlockAllBand = () => {
        //手动全选频段，点击锁定
        toggleAllBandBox(true)
        selectAllBand.checked = true
        const lockBandBtn = document.querySelector('#lockBandBtn')
        if (lockBandBtn) {
            lockBandBtn.click()
        }
    }

    //锁基站
    let initCellInfo = async (onlyRefreshLockedInfoList = false) => {
        try {
            //已锁基站信息
            //基站信息
            const { neighbor_cell_info, locked_cell_info } = await getData(new URLSearchParams({
                cmd: 'neighbor_cell_info,locked_cell_info'
            }))

            if (neighbor_cell_info && !onlyRefreshLockedInfoList) {
                const cellBodyEl = document.querySelector('#cellForm tbody')
                if (neighbor_cell_info.length <= 0) {
                    cellBodyEl.innerHTML = `<tr><td colspan="6" style="opacity:.66;text-align:center;color:var(--dark-text-color)">${t('no_neighbour_cell')}</td></tr>`
                } else {
                    cellBodyEl.innerHTML = neighbor_cell_info.map(item => {
                        const { band, earfcn, pci, rsrp, rsrq, sinr } = item
                        return `
                    <tr onclick="onSelectCellRow(${pci},${earfcn})">
                        <td>${band}</td>
                        <td>${earfcn}</td>
                        <td>${pci}</td>
                        <td>${kano_parseSignalBar(rsrp)}</td>
                        <td>${kano_parseSignalBar(sinr, -10, 30, 13, 0)}</td>
                        <td>${kano_parseSignalBar(rsrq, -20, -3, -9, -12)}</td>
                    </tr>
                `
                    }).join('')
                }
            }
            if (locked_cell_info) {
                const lockedCellBodyEl = document.querySelector('#LOCKED_CELL_FORM tbody')
                if (locked_cell_info.length <= 0) {
                    lockedCellBodyEl.innerHTML = `<tr><td colspan="3" style="opacity:.66;text-align:center;color:var(--dark-text-color)">${t('no_locked_cell')}</td></tr>`
                } else {
                    lockedCellBodyEl.innerHTML = locked_cell_info.map(item => {
                        const { earfcn, pci, rat } = item
                        return `
                    <tr>
                        <td>${rat == '12' ? '4G' : '5G'}</td>
                        <td>${pci}</td>
                        <td>${earfcn}</td>
                    </tr>
                `
                    }).join('')
                }
            }
        } catch (e) {
            // createToast(e.message)
        }
    }

    let cellInfoRequestTimer = null
    initCellInfo()

    const toggleLkcellOpen = (isOpen = false) => {
        const lkCellRefreshBtn = document.querySelector('#lkCellRefreshBtn')
        if (!lkCellRefreshBtn) return
        if (isOpen) {
            cellInfoRequestTimer && cellInfoRequestTimer()
            cellInfoRequestTimer = requestInterval(() => initCellInfo(), REFRESH_TIME + 1500)
            lkCellRefreshBtn.dataset.toggle = "1"
            lkCellRefreshBtn.innerHTML = t('stop_refresh')
        } else {
            cellInfoRequestTimer && cellInfoRequestTimer()
            lkCellRefreshBtn.dataset.toggle = "0"
            cellInfoRequestTimer = null
            lkCellRefreshBtn.innerHTML = t('start_refresh')
        }
    }

    const toggleCellInfoRefresh = (e) => {
        const target = e.target
        if (target) {
            const data = e.target.dataset.toggle
            if (data != "1") {
                toggleLkcellOpen(true)
            } else {
                toggleLkcellOpen(false)
            }
        }
    }

    let onSelectCellRow = (pci, earfcn) => {
        let pci_t = document.querySelector('#PCI')
        let earfcn_t = document.querySelector('#EARFCN')
        if (pci_t && earfcn_t && isNaN(pci) == false && isNaN(earfcn) == false) {
            pci_t.value = pci
            earfcn_t.value = earfcn
            createToast(`${t('toast_has_selected')}: ${pci},${earfcn}`, 'green')
        }
    }

    //锁基站
    const submitCellForm = async (e) => {
        e.preventDefault()
        if (!(await initRequestData())) {
            out()
            return null
        }
        try {
            const cookie = await login()
            if (!cookie) {
                createToast(t('toast_login_failed_check_network'), 'red')
                out()
                return null
            }

            const ratEl = e.target.querySelector('input[name="RAT"]:checked')
            const pciEl = e.target.querySelector('#PCI')
            const earfcnEl = e.target.querySelector('#EARFCN')

            if (!ratEl || !pciEl || !earfcnEl) return

            const form = {
                pci: pciEl.value.trim(),
                earfcn: earfcnEl.value.trim(),
                rat: ratEl.value.trim()
            }

            if (!form.pci || !form.earfcn) {
                createToast(t('toast_data_not_filling_done'), 'red')
                return
            }

            const res = await (await postData(cookie, {
                goformId: 'CELL_LOCK',
                ...form
            })).json()

            if (res.result == 'success') {
                pciEl.value = ''
                earfcnEl.value = ''
                createToast(t('toast_set_cell_success'), 'green')
                //刷新基站列表
                initCellInfo(true)
            } else {
                throw t('toast_set_cell_failed')
            }
        } catch (e) {
            createToast(t('toast_set_cell_failed'), 'red')
        }
    }

    let unlockAllCell = async () => {
        if (!(await initRequestData())) {
            out()
            return null
        }
        try {
            const cookie = await login()
            if (!cookie) {
                createToast(t('toast_login_failed_check_network'), 'red')
                out()
                return null
            }

            const res = await (await postData(cookie, {
                goformId: 'UNLOCK_ALL_CELL',
            })).json()

            if (res.result == 'success') {
                createToast(t('toast_unlock_cell_success'), 'green')
                //刷新基站列表
                initCellInfo(true)
            } else {
                throw t('toast_unlock_cell_failed')
            }
        } catch {
            createToast(t('toast_unlock_cell_failed'), 'red')
        }
    }

    let rebootBtnCount = 1
    let rebootTimer = null
    let rebootDevice = async (e) => {
        let target = e.target
        if (!(await initRequestData())) {
            out()
            target.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        target.style.backgroundColor = ''
        rebootTimer && clearTimeout(rebootTimer)
        if (rebootBtnCount == 1) target.innerHTML = t('reboot_confirm')
        if (rebootBtnCount == 2) target.innerHTML = t('reboot_confirm_confirm')
        if (rebootBtnCount >= 3) {
            target.innerHTML = t('rebooting')
            try {
                const cookie = await login()
                if (!cookie) {
                    createToast(t('toast_login_failed_check_network'), 'red')
                    out()
                    return null
                }

                const res = await (await postData(cookie, {
                    goformId: 'REBOOT_DEVICE',
                })).json()

                if (res.result == 'success') {
                    createToast(t('toast_rebot_success'), 'green')
                } else {
                    throw t('toast_reboot_failed')
                }

            } catch {
                createToast(t('toast_reboot_failed'), 'red')
            }
        }
        rebootBtnCount++
        rebootTimer = setTimeout(() => {
            rebootBtnCount = 1
            target.innerHTML = t("reboot")
        }, 3000);
    }

    rebootDeviceBtnInit = async () => {
        let target = document.querySelector('#REBOOT')
        if (!(await initRequestData())) {
            target.onclick = () => createToast(t('toast_please_login'), 'red')
            target.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        target.style.backgroundColor = ''
        target.onclick = rebootDevice
    }
    rebootDeviceBtnInit()

    //字段显示隐藏
    document.querySelector("#DICTIONARY").onclick = (e) => {
        showModal('#dictionaryModal')
    }

    document.querySelector('#DIC_LIST')?.addEventListener('click', (e) => {
        let target = e.target
        e.stopPropagation()
        e.stopImmediatePropagation()
        if (target.id == 'DIC_LIST') {
            return
        }
        let inputEl = null
        if ((target.tagName).toLowerCase() != 'input') {
            return
        } else {
            inputEl = target
        }
        let id = inputEl.getAttribute('data-name')
        //寻找这个id属于哪个dragList
        const list_id = inputEl.closest("ul").id
        let list_name = null
        if (list_id == "draggable_status") list_name = 'statusShowList'
        if (list_id == "draggable_signal") list_name = 'signalShowList'
        if (list_id == "draggable_props") list_name = 'propsShowList'

        if (list_name == null) return

        let index = showList[list_name].findIndex(i => i.name == id)
        if (index != -1) {
            showList[list_name][index].isShow = inputEl.checked
        }

        localStorage.setItem('showList', JSON.stringify(showList))
    }, false)

    let resetShowListBtnCount = 1
    let resetShowListTimer = null
    let resetShowList = (e) => {
        const target = e.target
        resetShowListTimer && clearTimeout(resetShowListTimer)
        if (resetShowListBtnCount == 1) target.innerHTML = t('btn_confirm_question')
        if (resetShowListBtnCount >= 2) {
            localStorage.removeItem('showList');
            localStorage.removeItem('statusShowListDOM');
            localStorage.removeItem('signalShowListDOM');
            localStorage.removeItem('propsShowListDOM');
            location.reload()
        }
        resetShowListBtnCount++
        resetShowListTimer = setTimeout(() => {
            resetShowListBtnCount = 1
            target.innerHTML = '重置(全选)'
        }, 3000);
    }

    const startRefresh = () => {
        StopStatusRenderTimer = requestInterval(() => handlerStatusRender(), REFRESH_TIME)
        QORSTimer = requestInterval(() => { QOSRDPCommand("AT+CGEQOSRDP=1") }, 10000)
    }
    const stopRefresh = () => {
        StopStatusRenderTimer && StopStatusRenderTimer()
        QORSTimer && QORSTimer()
    }

    //暂停开始刷新
    Array.from(document.querySelectorAll('.REFRESH_BTN'))?.forEach(el => {
        el.onclick = (e) => {
            if (e.target.innerHTML == t('start_refresh')) {
                Array.from(document.querySelectorAll('.REFRESH_BTN')).forEach(ee => {
                    ee.innerHTML = t('stop_refresh')
                })
                createToast(t('toast_start_refresh'), 'green')
                startRefresh()
            } else {
                Array.from(document.querySelectorAll('.REFRESH_BTN')).forEach(ee => {
                    ee.innerHTML = t('start_refresh')
                })
                createToast(t('toast_stop_refresh'), 'green')
                stopRefresh()
            }
        }
    })

    //流量管理逻辑
    document.querySelector("#DataManagement").onclick = () => {
        (async () => {
            if (!(await initRequestData())) {
                createToast(t('toast_please_login'), 'red')
                out()
                return null
            }
            // 查流量使用情况
            let res = await getDataUsage()
            if (!res) {
                createToast(t('toast_get_data_usage_failed'), 'red')
                return null
            }

            res = {
                ...res,
                "wan_auto_clear_flow_data_switch": isNullOrUndefiend(res.wan_auto_clear_flow_data_switch) ? res.wan_auto_clear_flow_data_switch : res.flux_auto_clear_flow_data_switch,
                "data_volume_limit_unit": isNullOrUndefiend(res.data_volume_limit_unit) ? res.data_volume_limit_unit : res.flux_data_volume_limit_unit,
                "data_volume_limit_size": isNullOrUndefiend(res.data_volume_limit_size) ? res.data_volume_limit_size : res.flux_data_volume_limit_size,
                "traffic_clear_date": isNullOrUndefiend(res.traffic_clear_date) ? res.traffic_clear_date : res.flux_clear_date,
                "data_volume_alert_percent": isNullOrUndefiend(res.data_volume_alert_percent) ? res.data_volume_alert_percent : res.flux_data_volume_alert_percent,
                "data_volume_limit_switch": isNullOrUndefiend(res.data_volume_limit_switch) ? res.data_volume_limit_switch : res.flux_data_volume_limit_switch,
            }

            // 预填充表单
            const form = document.querySelector('#DataManagementForm')
            if (!form) return null
            let data_volume_limit_switch = form.querySelector('input[name="data_volume_limit_switch"]')
            let wan_auto_clear_flow_data_switch = form.querySelector('input[name="wan_auto_clear_flow_data_switch"]')
            let data_volume_limit_unit = form.querySelector('input[name="data_volume_limit_unit"]')
            let traffic_clear_date = form.querySelector('input[name="traffic_clear_date"]')
            let data_volume_alert_percent = form.querySelector('input[name="data_volume_alert_percent"]')
            let data_volume_limit_size = form.querySelector('input[name="data_volume_limit_size"]')
            let data_volume_limit_type = form.querySelector('select[name="data_volume_limit_type"]')
            let data_volume_used_size = form.querySelector('input[name="data_volume_used_size"]')
            let data_volume_used_type = form.querySelector('select[name="data_volume_used_type"]')

            // (12094630728720/1024/1024)/1048576
            let used_size_type = 1
            const used_size = (() => {
                const total_bytes = ((Number(res.monthly_rx_bytes) + Number(res.monthly_tx_bytes))) / Math.pow(1024, 2)

                if (total_bytes < 1024) {
                    return total_bytes.toFixed(2)
                } else if (total_bytes >= 1024 && total_bytes < Math.pow(1024, 2)) {
                    used_size_type = 1024
                    return (total_bytes / 1024).toFixed(2)
                } else {
                    used_size_type = Math.pow(1024, 2)
                    return (total_bytes / Math.pow(1024, 2)).toFixed(2)
                }
            })()

            data_volume_limit_switch && (data_volume_limit_switch.checked = res.data_volume_limit_switch.toString() == '1')
            wan_auto_clear_flow_data_switch && (wan_auto_clear_flow_data_switch.checked = res.wan_auto_clear_flow_data_switch.toString() == 'on')
            data_volume_limit_unit && (data_volume_limit_unit.checked = res.data_volume_limit_unit.toString() == 'data')
            traffic_clear_date && (traffic_clear_date.value = res.traffic_clear_date.toString())
            data_volume_alert_percent && (data_volume_alert_percent.value = res.data_volume_alert_percent.toString())
            data_volume_limit_size && (data_volume_limit_size.value = res.data_volume_limit_size?.split('_')[0].toString())
            data_volume_limit_type && (() => {
                const val = Number(res.data_volume_limit_size?.split('_')[1])
                const option = data_volume_limit_type.querySelector(`option[data-value="${val}"]`)
                option && (option.selected = true)
            })()
            data_volume_used_size && (data_volume_used_size.value = used_size.toString())
            data_volume_used_type && (() => {
                const option = data_volume_used_type.querySelector(`option[data-value="${used_size_type.toFixed(0)}"]`)
                option && (option.selected = true)
            })()
            showModal('#DataManagementModal')
        })()
        initUfiDataManagementModal();
    }

    //流量管理表单提交
    let handleDataManagementFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const cookie = await login()
            if (!cookie) {
                createToast(t('toast_login_failed_check_network'), 'red')
                closeModal('#DataManagementModal')
                setTimeout(() => {
                    out()
                }, 310);
                return null
            }

            let form_data = {
                "data_volume_limit_switch": "0",
                "wan_auto_clear_flow_data_switch": "off",
                "data_volume_limit_unit": "data",
                "traffic_clear_date": "0",
                "data_volume_alert_percent": "0",
                "data_volume_limit_size": "0",
                "data_volume_limit_type": "1", //MB GB TB
                "data_volume_used_size": "0",
                "data_volume_used_type": "1", //MB GB TB
                // 时间
                "notify_deviceui_enable": "0",
            }

            const form = e.target; // 获取表单
            const formData = new FormData(form);

            for (const [key, value] of formData.entries()) {
                switch (key) {
                    case 'data_volume_limit_switch':
                        form_data[key] = value.trim() == 'on' ? '1' : '0'
                        form_data['flux_data_volume_limit_switch'] = value.trim() == 'on' ? '1' : '0'
                        break;
                    case 'wan_auto_clear_flow_data_switch':
                        form_data[key] = value.trim() == 'on' ? 'on' : '0'
                        form_data['flux_auto_clear_flow_data_switch'] = value.trim() == 'on' ? 'on' : '0'
                        break;
                    case 'data_volume_limit_unit':
                        form_data[key] = value.trim() == 'on' ? 'data' : 'time'
                        form_data['flux_data_volume_limit_unit'] = value.trim() == 'on' ? 'data' : 'time'
                        break;
                    case 'traffic_clear_date':
                        if (isNaN(Number(value.trim()))) {
                            createToast(t('toast_clear_date_must_be_number'), 'red')
                            return
                        }
                        if (Number(value.trim()) < 0 || Number(value.trim()) > 31) {
                            createToast(t('toast_clear_date_must_between_1_31'), 'red')
                            return
                        }
                        form_data[key] = value.trim()
                        form_data['flux_clear_date'] = value.trim()
                        break;
                    case 'data_volume_alert_percent':
                        if (isNaN(Number(value.trim())) || value.trim() == '') {
                            createToast(t('toast_alert_threshold_error'), 'red')
                            return
                        }
                        if (Number(value.trim()) < 0 || Number(value.trim()) > 100) {
                            createToast(t('toast_alert_threshold_must_between_0_100'), 'red')
                            return
                        }
                        form_data[key] = value.trim()
                        form_data['flux_data_volume_alert_percent'] = value.trim()
                        break;
                    case 'data_volume_limit_size':
                        if (isNaN(Number(value.trim()))) {
                            createToast(t('toast_plan_must_be_number'), 'red')
                            return
                        }
                        if (Number(value.trim()) <= 0) {
                            createToast(t('toast_plan_must_greater_than_0'), 'red')
                            return
                        }
                        form_data[key] = value.trim()
                        form_data['flux_data_volume_limit_size'] = value.trim()
                        break;
                    case 'data_volume_limit_type':
                        form_data[key] = '_' + value.trim()
                        form_data['flux_data_volume_limit_type'] = '_' + value.trim()
                        break;
                    case 'data_volume_used_size':
                        if (isNaN(Number(value.trim()))) {
                            createToast(t('toast_used_must_be_number'), 'red')
                            return
                        }
                        if (Number(value.trim()) <= 0) {
                            createToast(t('toast_used_must_greater_than_0'), 'red')
                            return
                        }
                        form_data[key] = value.trim()
                        break;
                    case 'data_volume_used_type':
                        form_data[key] = value.trim()
                        break;
                }
            }
            form_data['data_volume_limit_size'] = form_data['data_volume_limit_size'] + form_data['data_volume_limit_type']
            form_data['flux_data_volume_limit_size'] = form_data['data_volume_limit_size']
            const used_data = Number(form_data.data_volume_used_size) * Number(form_data['data_volume_used_type']) * Math.pow(1024, 2)
            const clear_form_data = {
                data_volume_limit_switch: form_data['data_volume_limit_switch'],
                wan_auto_clear_flow_data_switch: 'on',
                traffic_clear_date: '1',
                notify_deviceui_enable: '0',
                flux_data_volume_limit_switch: form_data['data_volume_limit_switch'],
                flux_auto_clear_flow_data_switch: 'on',
                flux_clear_date: '1',
                flux_notify_deviceui_enable: '0'
            }
            delete form_data['data_volume_limit_type']
            //发请求
            try {
                const tempData = form_data['data_volume_limit_switch'] == '0' ? clear_form_data : form_data
                const res = await (await postData(cookie, {
                    goformId: 'DATA_LIMIT_SETTING',
                    ...tempData
                })).json()

                const res1 = await (await postData(cookie, {
                    goformId: 'FLOW_CALIBRATION_MANUAL',
                    calibration_way: form_data.data_volume_limit_unit,
                    time: 0,
                    data: used_data.toFixed(0)
                })).json()

                if (res.result == 'success' && res1.result == 'success') {
                    createToast(t('toast_set_success'), 'green')
                    closeModal('#DataManagementModal')
                } else {
                    throw t('toast_set_failed')
                }
            } catch (e) {
                createToast(e.message, 'red')
            }
        } catch (e) {
            createToast(e.message, 'red')
        }
    };


    //WIFI管理逻辑
    let initWIFIManagementForm = async () => {
        try {
            let { WiFiModuleSwitch, ResponseList } = await getData(new URLSearchParams({
                cmd: 'queryWiFiModuleSwitch,queryAccessPointInfo'
            }))

            const WIFIManagementForm = document.querySelector('#WIFIManagementForm')
            const WIFIManagementContent = document.querySelector('#wifiInfo')
            if (!WIFIManagementForm) return

            if (WiFiModuleSwitch == "1" && ResponseList?.length) {
                WIFIManagementContent && (WIFIManagementContent.style.display = '')
                for (let index in ResponseList) {
                    if (ResponseList[index].AccessPointSwitchStatus == '1') {
                        let item = ResponseList[index]
                        let apEl = WIFIManagementForm.querySelector('input[name="AccessPointIndex"]')
                        let chipEl = WIFIManagementForm.querySelector('input[name="ChipIndex"]')
                        let ApMaxStationNumberEl = WIFIManagementForm.querySelector('input[name="ApMaxStationNumber"]')
                        let PasswordEl = WIFIManagementForm.querySelector('input[name="Password"]')
                        let ApBroadcastDisabledEl = WIFIManagementForm.querySelector('input[name="ApBroadcastDisabled"]')
                        let SSIDEl = WIFIManagementForm.querySelector('input[name="SSID"]')
                        let QRCodeImg = document.querySelector("#QRCodeImg")
                        let AuthModeEl = WIFIManagementForm.querySelector('select[name="AuthMode"]')
                        apEl && (apEl.value = item.AccessPointIndex)
                        chipEl && (chipEl.value = item.ChipIndex)
                        ApMaxStationNumberEl && (ApMaxStationNumberEl.value = item.ApMaxStationNumber)
                        PasswordEl && (PasswordEl.value = decodeBase64(item.Password))
                        ApBroadcastDisabledEl && (ApBroadcastDisabledEl.checked = item.ApBroadcastDisabled.toString() == '0')
                        SSIDEl && (SSIDEl.value = item.SSID)
                        // 二维码
                        fetch(KANO_baseURL + item.QrImageUrl, {
                            headers: common_headers
                        }).then(async (res) => {
                            const blob = await res.blob();
                            const objectURL = URL.createObjectURL(blob);
                            QRCodeImg.onload = () => {
                                URL.revokeObjectURL(objectURL);
                            };
                            QRCodeImg.src = objectURL;
                        });
                        const WIFI_FORM_SHOWABLE = document.querySelector('#WIFI_FORM_SHOWABLE')
                        AuthModeEl.value = item.AuthMode
                        AuthModeEl.selected = item.AuthMode
                        if (AuthModeEl && WIFI_FORM_SHOWABLE) {
                            const option = AuthModeEl.querySelector(`option[data-value="${item.AuthMode}"]`)
                            option && (option.selected = "selected")
                            if (item.AuthMode == "OPEN") {
                                WIFI_FORM_SHOWABLE.style.display = 'none'
                            } else {
                                WIFI_FORM_SHOWABLE.style.display = ''
                            }
                        }

                    }
                }
            } else {
                WIFIManagementContent && (WIFIManagementContent.style.display = 'none')
            }
        }
        catch (e) {
            console.error(e.message)
            // createToast(e.message)
        }
    }

    document.querySelector("#WIFIManagement").onclick = async () => {
        if (!(await initRequestData())) {
            createToast(t('toast_please_login'), 'red')
            out()
            return null
        }
        showModal("#WIFIManagementModal")
        await initWIFIManagementForm()
    }

    let handleWIFIManagementFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const cookie = await login()
            if (!cookie) {
                createToast(t('toast_login_failed_check_network'), 'red')
                closeModal('#WIFIManagementModal')
                setTimeout(() => {
                    out()
                }, 310);
                return null
            }

            const form = e.target; // 获取表单
            const formData = new FormData(form);

            let data = {
                SSID: '',
                AuthMode: '',
                EncrypType: '',
                Password: '',
                ApMaxStationNumber: '',
                ApBroadcastDisabled: 1,
                ApIsolate: 0,
                ChipIndex: 0,
                AccessPointIndex: 0
            }

            for (const [key, value] of formData.entries()) {
                switch (key) {
                    case 'SSID':
                        value.trim() && (data[key] = value.trim())
                        break;
                    case 'AuthMode':
                        value == 'OPEN' ? data['EncrypType'] = "NONE" : data['EncrypType'] = "CCMP"
                        value.trim() && (data[key] = value.trim())
                        break;
                    case 'ApBroadcastDisabled':
                        data[key] = value == 'on' ? 0 : 1
                        break;
                    case 'Password':
                        // if(!value.trim()) createToast('请输入密码！')
                        value.trim() && (data[key] = encodeBase64(value.trim()))
                        break;
                    case 'ApIsolate':
                    case 'ApMaxStationNumber':
                    case 'AccessPointIndex':
                    case 'ChipIndex':
                        !isNaN(Number(value.trim())) && (data[key] = Number(value.trim()))
                        break;
                }
            }

            if (data.AuthMode == 'OPEN' || data.EncrypType == "NONE") {
                delete data.Password
            } else {
                if (data.Password.length == 0) {
                    return createToast(t('toast_please_input_pwd'), 'red')
                }
                if (data.Password.length < 8) {
                    return createToast(t('toast_password_too_short'), 'red')
                }
                if (data.ApMaxStationNumber.length <= 0) {
                    return createToast(t('toast_max_client_must_greater_than_0'), 'red')
                }
            }

            const res = await (await postData(cookie, {
                goformId: 'setAccessPointInfo',
                ...data
            })).json()

            if (res.result == 'success') {
                createToast(t('toast_op_success_reconnect_wifi'), 'green')
                closeModal('#WIFIManagementModal')
            } else {
                throw t('toast_oprate_failed_check_network')
            }
        }
        catch (e) {
            console.error(e.message)
            // createToast(e.message)
        }
    }

    let handleWifiEncodeChange = (event) => {
        const WIFI_FORM_SHOWABLE = document.querySelector('#WIFI_FORM_SHOWABLE')
        const target = event.target
        if (target) {
            console.log(target.value);
            if (WIFI_FORM_SHOWABLE) {
                if (target.value == "OPEN") {
                    WIFI_FORM_SHOWABLE.style.display = 'none'
                } else {
                    WIFI_FORM_SHOWABLE.style.display = ''
                }
            }
        }
    }

    let handleShowPassword = (e) => {
        const target = e.target
        const WIFI_PASSWORD = document.querySelector('#WIFI_PASSWORD')
        if (target && WIFI_PASSWORD) {
            WIFI_PASSWORD.setAttribute('type', target.checked ? "text" : "password")
        }
    }

    document.querySelector('#PWDINPUT').addEventListener('keydown', (event) => {
        console.log(1, event);
        if (event.key === 'Enter') {
            onTokenConfirm()
        }
    });
    document.querySelector('#TOKEN').addEventListener('keydown', (event) => {
        console.log(2, event);
        if (event.key === 'Enter') {
            onTokenConfirm()
        }
    });

    //无线设备管理
    document.querySelector('#ClientManagement').onclick = async () => {
        if (!(await initRequestData())) {
            createToast(t('toast_please_login'), 'red')
            out()
            return null
        }
        showModal('#ClientManagementModal')
        await initClientManagementModal()
    }

    let initClientManagementModal = async () => {
        try {
            const { station_list, lan_station_list, BlackMacList, BlackNameList, AclMode, devices } = await getData(new URLSearchParams({
                cmd: 'station_list,lan_station_list,queryDeviceAccessControlList,hostNameList'
            }))
            const blackMacList = BlackMacList ? BlackMacList.split(';') : []
            const blackNameList = BlackNameList ? BlackNameList.split(';') : []

            const CONN_CLIENT_LIST = document.querySelector('#CONN_CLIENT_LIST')
            const BLACK_CLIENT_LIST = document.querySelector('#BLACK_CLIENT_LIST')

            let conn_client_html = ''
            let black_list_html = ''

            if (station_list && station_list.length) {
                conn_client_html += station_list.map(({ hostname, ip_addr, mac_addr }) => {
                    let hostname_show = escapeHtml(hostname)
                    if (devices) {
                        hostname_show = devices.find(i => i.mac == mac_addr)?.hostname || hostname
                    }
                    return `
            <div class="card-item" style="display: flex;width: 100%;margin: 10px 0;overflow: auto;">
                <div style="margin-right: 10px;">
                    <p>
                        <span>${t('client_mgmt_hostname')}：</span><span onclick="copyText(event)">${hostname_show}</span>
                        <svg onclick="editHostName('${hostname_show}','${mac_addr}')" class="svg-icon" style="margin-left:10px" fill="var(--dark-text-color)" stroke="currentColor" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width=".8rem" height=".8rem"><path d="M568.888889 28.444444v113.777778H142.222222v739.555556h739.555556V455.111111h113.777778v455.111111a85.333333 85.333333 0 0 1-85.333334 85.333334H113.777778A85.333333 85.333333 0 0 1 28.444444 910.222222V113.777778A85.333333 85.333333 0 0 1 113.777778 28.444444h455.111111z" p-id="5380"></path><path d="M881.777778 398.222222m11.377778 0l91.022222 0q11.377778 0 11.377778 11.377778l0 91.022222q0 11.377778-11.377778 11.377778l-91.022222 0q-11.377778 0-11.377778-11.377778l0-91.022222q0-11.377778 11.377778-11.377778Z" p-id="5381"></path><path d="M475.192889 656.327111l-102.286222-4.209778-5.973334-103.537777 346.851556-347.591112a11.377778 11.377778 0 0 1 16.099555-0.056888l92.16 91.591111a11.377778 11.377778 0 0 1 0 16.156444l-346.851555 347.591111zM876.202667 238.762667l-92.16-91.648a11.377778 11.377778 0 0 1 0-16.156445L879.104 36.408889a11.377778 11.377778 0 0 1 16.042667 0l92.16 91.704889a11.377778 11.377778 0 0 1 0 16.099555l-95.004445 94.549334a11.377778 11.377778 0 0 1-16.099555 0z" p-id="5382"></path><path d="M512 28.444444m11.377778 0l91.022222 0q11.377778 0 11.377778 11.377778l0 91.022222q0 11.377778-11.377778 11.377778l-91.022222 0q-11.377778 0-11.377778-11.377778l0-91.022222q0-11.377778 11.377778-11.377778Z" p-id="5383"></path></svg>
                    </p>
                    <p><span>${t('client_mgmt_mac')}：</span><span onclick="copyText(event)">${mac_addr}</span></p>
                    <p><span>${t('client_mgmt_ip')}：</span><span onclick="copyText(event)">${ip_addr}</span></p>
                    <p><span>${t('client_mgmt_conn_type')}：</span><span>${t('client_mgmt_conn_wireless')}</span></p>
                </div>
                <div style="flex:1;text-align: right;">
                    <button class="btn" style="padding: 20px 4px;" 
                        onclick="setOrRemoveDeviceFromBlackList('${[mac_addr, ...blackMacList].join(';')}','${[escapeHtml(hostname), ...blackNameList].join(';')}','${AclMode}')">
                        🚫 ${t('client_mgmt_block')}
                    </button>
                </div>
            </div>`}).join('')
            }

            if (lan_station_list && lan_station_list.length) {
                conn_client_html += lan_station_list.map(({ hostname, ip_addr, mac_addr }) => {
                    let hostname_show = escapeHtml(hostname)
                    if (devices) {
                        hostname_show = devices.find(i => i.mac == mac_addr)?.hostname || hostname
                    }
                    return `
            <div class="card-item" style="display: flex;width: 100%;margin: 10px 0;overflow: auto;">
                <div style="margin-right: 10px;">
                    <p>
                        <span>${t('client_mgmt_hostname')}：</span><span onclick="copyText(event)">${hostname_show}</span>
                        <svg onclick="editHostName('${hostname_show}','${mac_addr}')" class="svg-icon" style="margin-left:10px" fill="var(--dark-text-color)" stroke="currentColor" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width=".8rem" height=".8rem"><path d="M568.888889 28.444444v113.777778H142.222222v739.555556h739.555556V455.111111h113.777778v455.111111a85.333333 85.333333 0 0 1-85.333334 85.333334H113.777778A85.333333 85.333333 0 0 1 28.444444 910.222222V113.777778A85.333333 85.333333 0 0 1 113.777778 28.444444h455.111111z" p-id="5380"></path><path d="M881.777778 398.222222m11.377778 0l91.022222 0q11.377778 0 11.377778 11.377778l0 91.022222q0 11.377778-11.377778 11.377778l-91.022222 0q-11.377778 0-11.377778-11.377778l0-91.022222q0-11.377778 11.377778-11.377778Z" p-id="5381"></path><path d="M475.192889 656.327111l-102.286222-4.209778-5.973334-103.537777 346.851556-347.591112a11.377778 11.377778 0 0 1 16.099555-0.056888l92.16 91.591111a11.377778 11.377778 0 0 1 0 16.156444l-346.851555 347.591111zM876.202667 238.762667l-92.16-91.648a11.377778 11.377778 0 0 1 0-16.156445L879.104 36.408889a11.377778 11.377778 0 0 1 16.042667 0l92.16 91.704889a11.377778 11.377778 0 0 1 0 16.099555l-95.004445 94.549334a11.377778 11.377778 0 0 1-16.099555 0z" p-id="5382"></path><path d="M512 28.444444m11.377778 0l91.022222 0q11.377778 0 11.377778 11.377778l0 91.022222q0 11.377778-11.377778 11.377778l-91.022222 0q-11.377778 0-11.377778-11.377778l0-91.022222q0-11.377778 11.377778-11.377778Z" p-id="5383"></path></svg>
                    </p>
                    <p><span>${t('client_mgmt_mac')}：</span><span onclick="copyText(event)">${mac_addr}</span></p>
                    <p><span>${t('client_mgmt_ip')}：</span><span onclick="copyText(event)">${ip_addr}</span></p>
                    <p><span>${t('client_mgmt_conn_type')}：</span><span>${t('client_mgmt_conn_wired')}</span></p>
                </div>
                <div style="flex:1;text-align: right;">
                    <button class="btn" style="padding: 20px 4px;" 
                        onclick="setOrRemoveDeviceFromBlackList('${[mac_addr, ...blackMacList].join(';')}','${[escapeHtml(hostname), ...blackNameList].join(';')}','${AclMode}')">
                        🚫 ${t('client_mgmt_block')}
                    </button>
                </div>
            </div>`}).join('')
            }

            if (blackMacList.length && blackNameList.length) {
                black_list_html += blackMacList.map((item, index) => {
                    if (item) {
                        let params = `'${blackMacList.filter(i => item != i).join(';')}',` +
                            `'${blackMacList.filter(i => blackNameList[index] != i).join(';')}',` +
                            `'${AclMode}'`
                        return `
                    <div class="card-item" style="display: flex;width: 100%;margin: 10px 0;overflow: auto;">
                        <div style="margin-right: 10px;">
                            <p>
                                <span>${t('client_mgmt_hostname')}：</span><span onclick="copyText(event)">${blackNameList[index] ? blackNameList[index] : t('client_mgmt_unknown')}</span>
                                <svg onclick="editHostName('${blackNameList[index] || ''}','${item}')" class="svg-icon" style="margin-left:10px" fill="var(--dark-text-color)" stroke="currentColor" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width=".8rem" height=".8rem"><path d="M568.888889 28.444444v113.777778H142.222222v739.555556h739.555556V455.111111h113.777778v455.111111a85.333333 85.333333 0 0 1-85.333334 85.333334H113.777778A85.333333 85.333333 0 0 1 28.444444 910.222222V113.777778A85.333333 85.333333 0 0 1 113.777778 28.444444h455.111111z" p-id="5380"></path><path d="M881.777778 398.222222m11.377778 0l91.022222 0q11.377778 0 11.377778 11.377778l0 91.022222q0 11.377778-11.377778 11.377778l-91.022222 0q-11.377778 0-11.377778-11.377778l0-91.022222q0-11.377778 11.377778-11.377778Z" p-id="5381"></path><path d="M475.192889 656.327111l-102.286222-4.209778-5.973334-103.537777 346.851556-347.591112a11.377778 11.377778 0 0 1 16.099555-0.056888l92.16 91.591111a11.377778 11.377778 0 0 1 0 16.156444l-346.851555 347.591111zM876.202667 238.762667l-92.16-91.648a11.377778 11.377778 0 0 1 0-16.156445L879.104 36.408889a11.377778 11.377778 0 0 1 16.042667 0l92.16 91.704889a11.377778 11.377778 0 0 1 0 16.099555l-95.004445 94.549334a11.377778 11.377778 0 0 1-16.099555 0z" p-id="5382"></path><path d="M512 28.444444m11.377778 0l91.022222 0q11.377778 0 11.377778 11.377778l0 91.022222q0 11.377778-11.377778 11.377778l-91.022222 0q-11.377778 0-11.377778-11.377778l0-91.022222q0-11.377778 11.377778-11.377778Z" p-id="5383"></path></svg>
                            </p>
                            <p><span>${t('client_mgmt_mac')}：</span><span onclick="copyText(event)">${item}</span></p>
                        </div>
                        <div style="flex:1;text-align: right;">
                            <button class="btn" style="padding: 20px 4px;" onclick="setOrRemoveDeviceFromBlackList(${params})">
                                ✅ ${t('client_mgmt_unblock')}
                            </button>
                        </div>
                    </div>`
                    }
                }).join('')
            }

            if (conn_client_html == '') conn_client_html = `<p>${t('client_mgmt_no_device')}</p>`
            if (black_list_html == '') black_list_html = `<p>${t('client_mgmt_no_device')}</p>`

            CONN_CLIENT_LIST && (CONN_CLIENT_LIST.innerHTML = conn_client_html)
            BLACK_CLIENT_LIST && (BLACK_CLIENT_LIST.innerHTML = black_list_html)
        } catch (e) {
            console.error(e)
            createToast(t('client_mgmt_fetch_error'), 'red')
        }
    }

    const editHostName = async (name, mac) => {
        const { el, close } = createFixedToast('kano_edit_hostname', `
                <div style="pointer-events:all;width:80vw;max-width:300px;">
                <div class="title" style="margin:0" data-i18n="please_input_hostname">${t('please_input_hostname')}</div>
                <input class="user_select_none" type="text" style="border: none;padding:6px;width:100%;margin-top:10px" disabled value="MAC: ${mac}"></input>
                <input type="text" id="KANO_CONN_HOSTNAME" style="padding:6px;width:100%;margin:10px 0" data-i18n-placeholder="hostname" placeholder="${t("hostname")}" value="${name}"></input>
                <div style="display:flex;gap:10px">
                    <button id="close_kano_edit_hostname_toast_btn" style="width:100%;font-size:.64rem;margin-top:5px" data-i18n="confirm_btn">${t("confirm_btn")}</button>
                    <button id="close_kano_edit_hostname_toast_btn1" style="width:100%;font-size:.64rem;margin-top:5px" data-i18n="cancel_btn">${t("cancel_btn")}</button>
                </div>
                </div>
                `, 'red')
        const btn = el.querySelector('#close_kano_edit_hostname_toast_btn')
        const btn2 = el.querySelector('#close_kano_edit_hostname_toast_btn1')
        const hostname = el.querySelector("#KANO_CONN_HOSTNAME")

        if (!btn && !btn2 && !hostname) {
            close()
            return
        }
        btn2.onclick = () => {
            close()
        }
        btn.onclick = async () => {
            if (hostname.value.trim() == '') {
                createToast(t('toast_hostname_cannot_be_empty'), 'red')
                return
            }
            try {
                const res = await seConntHostName(mac, hostname.value.trim())
                if (res.result == 'success') {
                    createToast(t("toast_save_success"), 'pink')
                    initClientManagementModal()
                } else {
                    throw new Error(t("toast_save_failed"))
                }
            } catch (e) {
                createToast(t("toast_save_failed"), 'red')
            }
            close()
        }
    }

    let setOrRemoveDeviceFromBlackList = async (BlackMacList, BlackNameList, AclMode) => {
        try {
            const cookie = await login()
            if (!cookie) {
                createToast(t('toast_login_failed_check_network'), 'red')
                closeModal('#ClientManagementModal')
                setTimeout(() => {
                    out()
                }, 310);
                return null
            }
            const res = await postData(cookie, {
                goformId: "setDeviceAccessControlList",
                AclMode: AclMode.trim(),
                WhiteMacList: "",
                BlackMacList: BlackMacList.trim(),
                WhiteNameList: "",
                BlackNameList: BlackNameList.trim()
            })
            const { result } = await res.json()
            if (result && result == 'success') {
                createToast(t('toast_oprate_success'), 'green')
            } else {
                createToast(t('toast_oprate_failed'), 'red')
            }
            await initClientManagementModal()
        }
        catch (e) {
            console.error(e);
            createToast(t('toast_request_data_failed'), 'red')
        }
    }

    let closeClientManager = () => {
        closeModal('#ClientManagementModal')
    }

    //开关蜂窝数据
    let handlerCecullarStatus = async () => {
        const btn = document.querySelector('#CECULLAR')
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        let res = await getData(new URLSearchParams({
            cmd: 'ppp_status'
        }))
        btn.onclick = async () => {
            try {
                if (!(await initRequestData())) {
                    return null
                }
                const cookie = await login()
                if (!cookie) {
                    createToast(t('toast_login_failed_check_network'), 'red')
                    out()
                    return null
                }
                btn.innerHTML = t("changing")
                let res1 = await (await postData(cookie, {
                    goformId: res.ppp_status == 'ppp_disconnected' ? 'CONNECT_NETWORK' : 'DISCONNECT_NETWORK',
                })).json()
                if (res1.result == 'success') {
                    setTimeout(async () => {
                        await handlerCecullarStatus()
                        createToast(t('toast_oprate_success'), 'green')
                        QOSRDPCommand("AT+CGEQOSRDP=1")
                    }, 2000);
                } else {
                    createToast(t('toast_oprate_failed'), 'red')
                }
            } catch (e) {
                // createToast(e.message)
            }
        }
        btn.innerHTML = t('cellular')
        btn.style.backgroundColor = res.ppp_status == 'ppp_disconnected' ? '' : 'var(--dark-btn-color-active)'
    }
    handlerCecullarStatus()

    // title
    const loadTitle = async () => {
        try {
            const { app_ver, model, nickname } = await (await fetch(`${KANO_baseURL}/version_info`, { headers: common_headers })).json()
            if (model == nickname) {
                MODEL.innerHTML = `${model}`
                document.querySelector('#TITLE').innerHTML = `[${model}]UFI-TOOLS v${app_ver}`

            } else {
                MODEL.innerHTML = `${model} (${nickname})`
                document.querySelector('#TITLE').innerHTML = `[${nickname}]UFI-TOOLS v${app_ver}`
            }
            document.querySelector('#MAIN_TITLE').innerHTML = `UFI-TOOLS <span style="font-size:.8rem">v${app_ver}</span>`
        } catch {/*没有，不处理*/ }
    }
    loadTitle()

    //设置背景图片
    const initBGBtn = async () => {
        const btn = document.querySelector('#BG_SETTING')
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        btn.style.backgroundColor = ''
        btn.onclick = () => {
            showModal('#bgSettingModal')
            initBG()
        }
    }
    initBGBtn()

    //设置主题背景
    let handleSubmitBg = async (showSuccessToast = true) => {
        const imgUrl = getSafeLocalBackgroundUrl(document.querySelector('#BG_INPUT')?.value)
        const bg_checked = document.querySelector('#isCheckedBG')?.checked
        const BG = document.querySelector('#BG')
        const BG_OVERLAY = document.querySelector('#BG_OVERLAY')
        const isCloudSync = document.querySelector("#isCloudSync")

        localStorage.setItem("isCloudSync", isCloudSync.checked)

        if (!BG || bg_checked == undefined || !BG_OVERLAY) return
        if (!bg_checked) {
            BG.style.backgroundImage = 'unset'
            localStorage.removeItem('backgroundUrl')
        } else {
            if (!imgUrl) return createToast(t('privacy_background_notice'), 'red')
            BG.style.backgroundImage = `url("${imgUrl}")`
            localStorage.setItem('backgroundUrl', imgUrl)
        }
        //发请求同步数据
        if (isCloudSync.checked) {
            try {
                const { result, error } = await (await fetch(`${KANO_baseURL}/set_theme`, {
                    method: 'POST',
                    headers: common_headers,
                    body: JSON.stringify({
                        "backgroundEnabled": bg_checked,
                        "backgroundUrl": localStorage.getItem("backgroundUrl") || '',
                        "textColor": localStorage.getItem("textColor"),
                        "textColorPer": localStorage.getItem("textColorPer"),
                        "themeColor": localStorage.getItem("themeColor"),
                        "colorPer": localStorage.getItem("colorPer"),
                        "saturationPer": localStorage.getItem("saturationPer"),
                        "brightPer": localStorage.getItem("brightPer"),
                        "opacityPer": localStorage.getItem("opacityPer"),
                        "blurSwitch": localStorage.getItem("blurSwitch"),
                        "overlaySwitch": localStorage.getItem("overlaySwitch")
                    })
                })).json()

                if (result == "success") {
                    showSuccessToast && createToast(t('toast_save_success_sync'), 'green')
                    document.querySelector('#fileUploader').value = ''
                    closeModal('#bgSettingModal')
                }
                else throw error || ''
            }
            catch (e) {
                createToast(t('toast_sync_failed'), 'red')
            }
        } else {
            document.querySelector('#fileUploader').value = ''
            closeModal('#bgSettingModal')
            createToast(t('toast_save_success_local'), 'green')
        }
    }

    //手动同步主题
    const syncTheme = async () => {
        await initTheme(true)
        await initBG()
        createToast(t('toast_sync_success'), 'green')
    }

    //初始化背景图片
    const initBG = async () => {
        const BG = document.querySelector('#BG')
        const imgUrl = getSafeLocalBackgroundUrl(localStorage.getItem('backgroundUrl'))
        if (!imgUrl) localStorage.removeItem('backgroundUrl')
        const isCheckedBG = document.querySelector('#isCheckedBG')
        const BG_INPUT = document.querySelector('#BG_INPUT')

        if (!BG || !isCheckedBG || !BG_INPUT) return
        isCheckedBG.checked = imgUrl ? true : false
        if (imgUrl?.length < 9999) {
            BG_INPUT.value = imgUrl
        }
        if (!imgUrl) {
            BG_INPUT.value = ''
            BG.style.backgroundImage = 'unset'
            return
        }

        BG.style.backgroundImage = `url("${imgUrl}")`
    }
    initBG()

    //重置主题
    let resetThemeBtnTimer = 1
    let isConfirmResetTheme = false
    const resetTheme = async (e) => {
        e.target.innerHTML = t('reset_theme_confirm')
        resetThemeBtnTimer && clearTimeout(resetThemeBtnTimer)
        resetThemeBtnTimer = setTimeout(() => {
            isConfirmResetTheme = false
            e.target.disabled = false
            e.target.innerHTML = t('reset_theme_btn')
        }, 2000)
        if (!isConfirmResetTheme) {
            isConfirmResetTheme = true
            return
        }
        const isSync = localStorage.getItem("isCloudSync", isCloudSync.checked)
        if (isSync == true || isSync == "true") {
            try {
                const { result, error } = await (await fetch(`${KANO_baseURL}/set_theme`, {
                    method: 'POST',
                    headers: common_headers,
                    body: JSON.stringify({})
                })).json()

                if (result == "success") {
                    localStorage.removeItem('themeColor')
                    localStorage.removeItem('textColorPer')
                    localStorage.removeItem('textColor')
                    localStorage.removeItem('saturationPer')
                    localStorage.removeItem('opacityPer')
                    localStorage.removeItem('colorPer')
                    localStorage.removeItem('brightPer')

                    createToast(t('toast_reset_success'), 'green')
                    document.querySelector('#fileUploader').value = ''
                    setTimeout(() => {
                        initBG().then(() => {
                            handleSubmitBg(false)
                        })
                    }, 100);
                }
                else throw error || ''
            }
            catch (e) {
                createToast(t('toast_reset_failed'), 'red')
            }
        } else {
            createToast(t('toast_must_enable_sync_to_reset'), 'red')
        }
        initTheme && initTheme()
        e.target.innerHTML = t('reset_theme_btn')
        e.target.disabled = true
    }

    //定时重启模态框
    let initScheduleRebootStatus = async () => {
        const btn = document.querySelector('#SCHEDULE_REBOOT')
        const SCHEDULE_TIME = document.querySelector('#SCHEDULE_TIME')
        const SCHEDULE_ENABLED = document.querySelector('#SCHEDULE_ENABLED')
        if (!btn) return
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }

        const { restart_schedule_switch, restart_time } = await getData(new URLSearchParams({
            cmd: 'restart_schedule_switch,restart_time'
        }))

        SCHEDULE_ENABLED.checked = restart_schedule_switch == '1'
        SCHEDULE_TIME.value = restart_time
        btn.style.backgroundColor = restart_schedule_switch == '1' ? 'var(--dark-btn-color-active)' : ''

        btn.onclick = async () => {
            if (!(await initRequestData())) {
                btn.onclick = () => createToast(t('toast_please_login'), 'red')
                btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
                return null
            }
            showModal('#scheduleRebootModal')
        }
    }
    initScheduleRebootStatus()

    let handleScheduleRebootFormSubmit = async (e) => {
        e.preventDefault()
        const data = {
            restart_schedule_switch: "0",
            restart_time: '00:00'
        }
        const form = e.target; // 获取表单
        const formData = new FormData(form);
        let regx = /^(0?[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[1-5][0-9])$/
        for ([key, value] of formData.entries()) {
            switch (key) {
                case 'restart_time':
                    if (!regx.exec(value.trim()) || !value.trim()) return createToast(t('toast_please_input_correct_reboot_time'), 'red')
                    data.restart_time = value.trim()
                    break;
                case 'restart_schedule_switch':
                    data.restart_schedule_switch = value == 'on' ? '1' : '0'
            }
        }
        try {
            const cookie = await login()
            try {
                const res = await (await postData(cookie, {
                    goformId: 'RESTART_SCHEDULE_SETTING',
                    restart_time: data.restart_time,
                    restart_schedule_switch: data.restart_schedule_switch
                })).json()
                if (res?.result == 'success') {
                    createToast(t('toast_set_success'), 'green')
                    initScheduleRebootStatus()
                    closeModal('#scheduleRebootModal')
                } else {
                    throw t('toast_set_failed')
                }
            } catch {
                createToast(t('toast_set_failed'), 'red')
            }
        } catch {
            createToast(t('toast_login_failed_check_network_and_pwd'), 'red')
        }
    }

    // U30AIR用关机指令
    let shutDownBtnCount = 1
    let shutDownBtnTimer = null
    let initShutdownBtn = async () => {
        const btn = document.querySelector('#SHUTDOWN')
        if (!btn) return
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }

        const { battery_value, battery_vol_percent } = await getData(new URLSearchParams({
            cmd: 'battery_value,battery_vol_percent'
        }))

        if (battery_value && battery_vol_percent && (battery_value != '' && battery_vol_percent != '')) {
            // 显示按钮
            btn.style.display = ''

        } else {
            //没电池的不显示此按钮
            btn.style.display = 'none'
        }
        btn.style.backgroundColor = 'var(--dark-btn-color)'
        btn.onclick = async () => {
            if (!(await initRequestData())) {
                btn.onclick = () => createToast(t('toast_please_login'), 'red')
                btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
                return null
            }
            shutDownBtnCount++
            btn.innerHTML = t('confirm_shutdown')
            shutDownBtnTimer && clearTimeout(shutDownBtnTimer)
            shutDownBtnTimer = setTimeout(() => {
                shutDownBtnCount = 0
                btn.innerHTML = t('shutdown')
            }, 3000)
            if (shutDownBtnCount < 3) {
                return
            } else {
                btn.innerHTML = t("shutting_down")
            }
            try {
                const cookie = await login()
                try {
                    const res = await (await postData(cookie, {
                        goformId: 'SHUTDOWN_DEVICE'
                    })).json()
                    if (res?.result == 'success') {
                        createToast(t('toast_shutdown_success'), 'green')
                    } else {
                        createToast(t('toast_shutdown_failed'), 'red')
                    }
                } catch {
                    createToast(t('toast_shutdown_failed'), 'red')
                }
            } catch {
                createToast(t('toast_login_failed_check_network_and_pwd'), 'red')
            }
        }
    }
    initShutdownBtn()

    // 启用TTYD（如果有）
    let initTTYD = async () => {
        const TTYD = document.querySelector('#TTYD')
        if (!TTYD) return
        const list = TTYD.querySelector('.deviceList')
        if (!list) return
        //fetch TTYD地址，如有，则显示
        try {
            const port = localStorage.getItem('ttyd_port')
            if (!port) return
            const TTYD_INPUT = document.querySelector('#TTYD_INPUT')
            TTYD_INPUT && (TTYD_INPUT.value = port)
            const res = await (await fetch(`${KANO_baseURL}/hasTTYD?port=${port}`, {
                method: "get",
                headers: common_headers
            })).json()
            if (res.code !== '200') {
                TTYD.style.display = 'none'
                list.innerHTML = ``
                return
            }
            console.log('TTYD found')
            TTYD.style.display = ''
            setTimeout(() => {
                const title = TTYD.querySelector('.title strong')
                title && (title.innerHTML = "TTYD")
                list.innerHTML = `
        <li style = "padding:10px">
                    <iframe src="http://${res.ip}" style="border:none;padding:0;margin:0;width:100%;height:400px;border-radius: 10px;overflow: hidden;opacity: .6;"></iframe>
        </li > `
            }, 600);
        } catch {
            // console.log();
        }
    }
    initTTYD()

    let click_count_ttyd = 1
    let ttyd_timer = null
    let enableTTYD = () => {
        click_count_ttyd++
        if (click_count_ttyd >= 4) {
            // 启用ttyd弹窗
            initResServer()
            showModal('#TTYDModal')
            ttyd_timer && clearTimeout(ttyd_timer)
            click_count_ttyd = 1
        }
        ttyd_timer && clearTimeout(ttyd_timer)
        ttyd_timer = setTimeout(() => {
            click_count_ttyd = 1
        }, 1999)
    }

    let handleTTYDFormSubmit = (e) => {
        e.preventDefault()
        const form = e.target
        const formData = new FormData(form);
        const ttyd_port = formData.get('ttyd_port')
        if (!ttyd_port || ttyd_port.trim() == '') return createToast(t('toast_please_input_port'), 'red')
        let ttydNumber = Number(ttyd_port.trim())
        if (isNaN(ttydNumber) || ttydNumber <= 0 || ttydNumber > 65535) return createToast(t('toast_please_input_port_correct'), 'red')
        // 保存ttyd port
        localStorage.setItem('ttyd_port', ttyd_port)
        createToast(t('toast_save_success'), 'green')
        initTTYD()
    }

    let changeResServer = async (e) => {
        e.preventDefault()
        const RES_SERVER_INPUT = document.querySelector('#RES_SERVER_INPUT')
        if (!RES_SERVER_INPUT) return
        const url = RES_SERVER_INPUT.value.trim()
        if (!url || url.length == 0) return createToast("Please input res server!", 'red')
        const res = await (await fetchWithTimeout(`${KANO_baseURL}/set_res_server`, {
            method: 'POST',
            headers: common_headers,
            body: JSON.stringify({ res_server: url })
        }, 5000)).json()
        if (res.result != "success") {
            return createToast(t('toast_save_failed'), 'red')
        }
        createToast(t('toast_save_success'), 'green')
        closeModal('#resServerModal')
    }

    let initResServer = async () => {
        const RES_SERVER_INPUT = document.querySelector('#RES_SERVER_INPUT')
        if (!RES_SERVER_INPUT) return
        try {
            const { res_server } = await (await fetchWithTimeout(`${KANO_baseURL}/get_res_server`, {
                method: 'GET',
                headers: common_headers
            })).json()
            RES_SERVER_INPUT.value = res_server || ''
        } catch {
            // no handle
        }
    }

    function parseCGEQOSRDP(input) {
        const match = input.match(/\+CGEQOSRDP:\s*(.+?)\s*OK/);
        if (!match) {
            return input
        }

        const parts = match[1].split(',').map(Number);
        if (parts.length < 8) {
            return input
        }
        return `QCI：${parts[1]} ⬇️ ${+parts[6] / 1000}Mbps ⬆️ ${+parts[7] / 1000}Mbps`
    }


    const executeATCommand = async (command, slot = null) => {
        if (slot == null || slot == undefined) {
            let at_slot_value = document.querySelector("#AT_SLOT")?.value
            if (isNaN(Number(at_slot_value?.trim())) || at_slot_value == undefined || at_slot_value == null) {
                slot = 0
            } else {
                slot = at_slot_value.trim()
            }
        }
        try {
            const command_enc = encodeURIComponent(command)
            const res = await (await fetch(`${KANO_baseURL}/AT?command=${command_enc}&slot=${slot}`, { headers: common_headers })).json()
            return res
        } catch (e) {
            return null
        }
    }

    async function QOSRDPCommand(cmd) {
        if (!cmd) return QORS_MESSAGE = null
        let sim_slot = null
        // 获取当前卡槽
        if (UFI_DATA && UFI_DATA.sim_slot != undefined && UFI_DATA.sim_slot != null && UFI_DATA.sim_slot != '') {
            sim_slot = UFI_DATA.sim_slot
        }
        else {
            let { sim_slot: s } = await getData(new URLSearchParams({
                cmd: 'sim_slot'
            }))
            sim_slot = s
        }

        //获取是否支持双sim卡
        let dual_sim_support = null
        if (UFI_DATA && UFI_DATA.dual_sim_support != undefined && UFI_DATA.dual_sim_support != null && UFI_DATA.dual_sim_support != '') {
            dual_sim_support = UFI_DATA.dual_sim_support
        } else {
            const { dual_sim_support: d } = await getData(new URLSearchParams({
                cmd: 'dual_sim_support'
            }))
            dual_sim_support = d
        }

        if (!sim_slot || dual_sim_support != '1') {
            //单卡用户默认0槽位
            sim_slot = 0
        }

        // V50 内置卡1(移动)slot=0 内置卡2(电信)slot=1 内置卡3(联通)slot=2 外置卡slot=11 外置卡 slot需要设置为0 联通内置卡slot设置为1
        // For V50
        if (sim_slot == "11") {
            //可恶的F50Pro两个卡槽居然是反过来的
            if (UFI_DATA && UFI_DATA.model == "MU3356") {
                sim_slot = 1
            } else {
                sim_slot = 0
            }
        }
        if (sim_slot == "2") {
            sim_slot = 1
        }
        // For F50Pro
        if (sim_slot == "12") {
            sim_slot = 0
        }

        let res = await executeATCommand(cmd, sim_slot)
        //如果是单卡用户，0槽位又获取不到数据，那就尝试1槽位
        if (res.result && res.result.includes('ERROR')) {
            if (dual_sim_support != '1') {
                sim_slot = 1
                res = await executeATCommand(cmd, sim_slot)
            }
        }
        if (res.result) return QORS_MESSAGE = parseCGEQOSRDP(res.result)
        return QORS_MESSAGE = null
    }
    QOSRDPCommand("AT+CGEQOSRDP=1")
    let QORSTimer = requestInterval(() => { QOSRDPCommand("AT+CGEQOSRDP=1") }, 10000)

    const initHighRailBtn = async () => {
        const highRailModeBtn = document.querySelector('#highRailModeBtn')
        if (highRailModeBtn) {
            try {
                const params = "AT+SP5GCMDS=\"get nr synch_param\",44"
                const res = await executeATCommand(params);
                highRailModeBtn.dataset.enabled = '0'
                if (res) {
                    if (res.error) {
                        AT_RESULT.innerHTML = `<p style="overflow: hidden;">${res.error}</p>`;
                        !silent && createToast(t('toast_exe_failed'), 'red');
                        return false
                    }
                    if (res.result.includes('synch_param,44,1')) {
                        highRailModeBtn.dataset.enabled = '1'
                        highRailModeBtn.style.backgroundColor = 'var(--dark-btn-color-active)'
                    }
                }
            } catch {
                highRailModeBtn.dataset.enabled = '0'
            }
        }
    }

    const initVoLTESwitchBtn = async () => {
        const voLTESwitchBtn = document.querySelector('#VoLTESwitchBtn')
        const voLTESwitchBtn1 = document.querySelector('#VoLTESwitchBtn1')
        if (voLTESwitchBtn) {
            try {
                const res = await (await fetchWithTimeout(`${KANO_baseURL}/volte_status?slot=0`)).json()
                if (res) {
                    voLTESwitchBtn.dataset.enabled = res.enabled ? "1" : "0"
                    voLTESwitchBtn.style.backgroundColor = res.enabled ? 'var(--dark-btn-color-active)' : ''
                }
            } catch (e) {
                voLTESwitchBtn.dataset.enabled = '0'
                voLTESwitchBtn.style.backgroundColor = ''
                console.log('fetch volte status error', e)
            }
        }
        if (voLTESwitchBtn1) {
            try {
                const res = await (await fetchWithTimeout(`${KANO_baseURL}/volte_status?slot=1`)).json()
                if (res) {
                    voLTESwitchBtn1.dataset.enabled = res.enabled ? "1" : "0"
                    voLTESwitchBtn1.style.backgroundColor = res.enabled ? 'var(--dark-btn-color-active)' : ''
                }
            } catch (e) {
                voLTESwitchBtn1.dataset.enabled = '0'
                voLTESwitchBtn1.style.backgroundColor = ''
                console.log('fetch volte status error', e)
            }
        }
    }

    const initVoNRSwitchBtn = async () => {
        const voNRSwitchBtn = document.querySelector('#VoNRSwitchBtn')
        const voNRSwitchBtn1 = document.querySelector('#VoNRSwitchBtn1')
        if (voNRSwitchBtn) {
            try {
                const res = await (await fetchWithTimeout(`${KANO_baseURL}/vonr_status?slot=0`)).json()
                if (res) {
                    voNRSwitchBtn.dataset.enabled = res.enabled ? "1" : "0"
                    voNRSwitchBtn.style.backgroundColor = res.enabled ? 'var(--dark-btn-color-active)' : ''
                }
            } catch (e) {
                voNRSwitchBtn.dataset.enabled = '0'
                voNRSwitchBtn.style.backgroundColor = ''
                console.log('fetch vonr status error', e)
            }
        }
        if (voNRSwitchBtn1) {
            try {
                const res = await (await fetchWithTimeout(`${KANO_baseURL}/vonr_status?slot=1`)).json()
                if (res) {
                    voNRSwitchBtn1.dataset.enabled = res.enabled ? "1" : "0"
                    voNRSwitchBtn1.style.backgroundColor = res.enabled ? 'var(--dark-btn-color-active)' : ''
                }
            } catch (e) {
                voNRSwitchBtn1.dataset.enabled = '0'
                voNRSwitchBtn1.style.backgroundColor = ''
                console.log('fetch vonr status error', e)
            }
        }
    }

    let initATBtn = async () => {
        const el = document.querySelector('#AT')
        if (!(await initRequestData()) || !el) {
            el.onclick = () => createToast(t('toast_please_login'), 'red')
            el.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        el.style.backgroundColor = ''
        el.onclick = () => {
            initHighRailBtn()
            initVoLTESwitchBtn()
            initVoNRSwitchBtn()
            showModal('#ATModal')
        }
    }
    initATBtn()


    const handleATFormSubmit = async () => {
        const AT_value = document.querySelector('#AT_INPUT')?.value;
        if (!AT_value || AT_value.trim() === '') {
            return createToast(t('toast_please_input_AT'), 'red');
        }

        const AT_RESULT = document.querySelector('#AT_RESULT');
        AT_RESULT.innerHTML = t('toast_running_please_wait')

        try {
            const res = await executeATCommand(AT_value.trim());

            if (res) {
                if (res.error) {
                    AT_RESULT.innerHTML = `<p style="overflow: hidden;">${res.error}</p>`;
                    createToast(t('toast_exe_failed'), 'red');
                    return;
                }
                //清空imei缓存
                resetDiagImeiCache()
                AT_RESULT.innerHTML = `<p onclick="copyText(event)"  style="overflow: hidden;">${parseCGEQOSRDP(res.result)}</p>`;
                createToast(t('toast_exe_success'), 'green');
            } else {
                createToast(t('toast_exe_failed'), 'red');
            }

        } catch (err) {
            const error = err?.error || t('toast_unknow_err');
            AT_RESULT.innerHTML = `<p style="overflow: hidden;">${error}</p>`;
            createToast(t('toast_exe_failed'), 'red');
        }
    };

    const handleQosAT = async () => {
        const AT_RESULT = document.querySelector('#AT_RESULT');
        AT_RESULT.innerHTML = t('toast_running_please_wait');

        try {
            const res = await executeATCommand('AT+CGEQOSRDP=1');

            if (res) {
                if (res.error) {
                    AT_RESULT.innerHTML = `<p style="overflow: hidden;">${res.error}</p>`;
                    createToast(t('toast_exe_failed'), 'red');
                    return;
                }

                AT_RESULT.innerHTML = `<p onclick="copyText(event)"  style="overflow: hidden;">${parseCGEQOSRDP(res.result)}</p>`;
                createToast(t('toast_exe_success'), 'green');
            } else {
                createToast(t('toast_exe_failed'), 'red');
            }

        } catch (err) {
            const error = err?.error || t('toast_unknow_err');
            AT_RESULT.innerHTML = `<p style="overflow: hidden;">${error}</p>`;
            createToast(t('toast_exe_failed'), 'red');
        }
    };

    const handleAT = async (params, silent = false) => {
        if (!params) return
        // 执行AT
        const AT_RESULT = document.querySelector('#AT_RESULT')
        AT_RESULT.innerHTML = t('toast_running_please_wait')
        try {
            const res = await executeATCommand(params);
            if (res) {
                if (res.error) {
                    AT_RESULT.innerHTML = `<p style="overflow: hidden;">${res.error}</p>`;
                    !silent && createToast(t('toast_exe_failed'), 'red');
                    return false
                }

                AT_RESULT.innerHTML = `<p onclick="copyText(event)"  style="overflow: hidden;">${res.result}</p>`;
                !silent && createToast(t('toast_exe_success'), 'green');
                //只要执行AT了，就默认清空一次imei展示缓存
                resetDiagImeiCache()
                return true
            } else {
                !silent && createToast(t('toast_exe_failed'), 'red');
                return false
            }
        } catch (err) {
            const error = err?.error || t('toast_unknow_err');
            AT_RESULT.innerHTML = `<p style="overflow: hidden;">${error}</p>`;
            !silent && createToast(t('toast_exe_failed'), 'red');
            return false
        }
    }

    //执行时禁用按钮
    const disableButtonWhenExecuteFunc = async (e, func) => {
        const target = e.currentTarget
        target.setAttribute("disabled", "true");
        target.style.opacity = '.5'
        try {
            if (func) {
                await func()
            }
        } finally {
            target.removeAttribute("disabled");
            target.style.opacity = ''
        }
    }

    const socatAlive = async () => {
        let res = await checkAdvancedFunc()
        if (res) {
            let smb = document.querySelector('#SMB')
            smb && (smb.style.display = 'none')
        }
        const socat_status = document.querySelectorAll('.socat_status')
        if (socat_status) {
            socat_status.forEach(item => {
                item.innerHTML = res ? `${t('advanced')}：🟢 ${t('advanced_tools_on')}` : `${t('advanced')}：🔴 ${t('advanced_tools_off')}`
            })
        }
    }
    socatAlive()

    let socatTimerFn = null

    //初始化高级功能按钮
    let initAdvanceTools = async () => {
        const el = document.querySelector('#ADVANCE')
        if (!(await initRequestData()) || !el) {
            el.onclick = () => createToast(t('toast_please_login'), 'red')
            el.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        el.style.backgroundColor = ''
        el.onclick = () => {
            showModal('#advanceModal')
            //循环检测是否开启socat
            socatAlive()
            socatTimerFn && socatTimerFn()
            socatTimerFn = requestInterval(() => socatAlive(), 1000)
        }
    }
    initAdvanceTools()

    const closeAdvanceToolsModal = () => {
        socatTimerFn && socatTimerFn()
        closeModal('#advanceModal')
    }

    //执行高级功能更改 1为启用0为禁用
    const handleSambaPath = async (flag = '1') => {
        const AT_RESULT = document.querySelector('#AD_RESULT')
        // let adb_status = await adbKeepAlive()
        // if (!adb_status) {
        //     AT_RESULT.innerHTML = ""
        //     return createToast(t('toast_ADB_not_init'), 'red')
        // }

        AT_RESULT.innerHTML = t('toast_running_please_wait')

        if (flag == '1') {
            try {
                const cookie = await login()
                if (cookie) {
                    await (await postData(cookie, {
                        goformId: 'SAMBA_SETTING',
                        samba_switch: '1'
                    })).json()
                }
                await initSMBStatus()
            } catch { }
        }
        try {
            const res = await (await fetch(`${KANO_baseURL}/smbPath?enable=${flag}`, { headers: common_headers })).json()
            if (res) {
                if (res.error) {
                    AT_RESULT.innerHTML = res.error;
                    createToast(t('toast_exe_failed'), 'red');
                    return;
                }
                AT_RESULT.innerHTML = res.result;
                createToast(t('toast_exe_done'), 'green');
            } else {
                AT_RESULT.innerHTML = '';
                createToast(t('toast_exe_failed'), 'red');
            }
        } catch (e) {
            AT_RESULT.innerHTML = '';
            createToast(t('toast_exe_failed'), 'red');
        }
    }

    const loadOfficialWebPwdContent = async () => {
        const official_web_pwd = document.querySelector("#official_web_pwd")
        if (!official_web_pwd) return
        try {
            const { pwd } = await (await fetchWithTimeout(`${KANO_baseURL}/get_official_web_password`)).json()
            if (pwd != null && pwd != undefined) {
                official_web_pwd.textContent = pwd
            }
        } catch (e) {
            console.error("loadOfficialWebPwdContent 请求失败：", e)
        }
    }
    //更改密码
    initChangePassData = async () => {
        const el = document.querySelector("#CHANGEPWD")
        if (!(await initRequestData()) || !el) {
            el.onclick = () => createToast(t('toast_please_login'), 'red')
            el.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        el.style.backgroundColor = ''
        el.onclick = async () => {
            loadOfficialWebPwdContent()
            showModal('#changePassModal')
        }
    }
    initChangePassData()

    const handleChangePassword = async (e) => {
        e.preventDefault()
        const form = e.target
        const formData = new FormData(form);
        const oldPassword = formData.get('oldPassword')
        const newPassword = formData.get('newPassword')
        const confirmPassword = formData.get('confirmPassword')
        if (!oldPassword || oldPassword.trim() == '') return createToast(t('toast_please_input_old_pwd'), 'red')
        if (!newPassword || newPassword.trim() == '') return createToast(t('toast_please_input_new_pwd'), 'red')
        if (!confirmPassword || confirmPassword.trim() == '') return createToast(t('toast_please_input_new_conform_pwd'), 'red')
        if (newPassword != confirmPassword) return createToast(t('toast_pwd_not_eqal'), 'red')

        try {
            const cookie = await login()
            try {
                const res = await (await postData(cookie, {
                    goformId: 'CHANGE_PASSWORD',
                    oldPassword: SHA256(oldPassword),
                    newPassword: SHA256(newPassword)
                })).json()
                if (res?.result == 'success') {
                    createToast(t('toast_change_success'), 'green')
                    form.reset()
                    //更新后端ADMIN_PWD字段
                    const update_res = await updateAdminPsw(newPassword.trim())
                    if (!update_res || update_res.result != 'success') {
                        console.error('Update admin password failed:', update_res ? update_res.message : 'No response');
                    }
                    KANO_PASSWORD = newPassword.trim()
                    localStorage.setItem('kano_sms_pwd', newPassword.trim())
                    closeModal('#changePassModal')
                } else {
                    throw t('toast_change_failed')
                }
            } catch {
                createToast(t('toast_change_failed'), 'red')
            }
        } catch {
            createToast(t('toast_login_failed_check_network_and_pwd'), 'red')
            closeModal('#changePassModal')
        }
    }

    const onCloseChangePassForm = () => {
        const form = document.querySelector("#changePassForm")
        form && form.reset()
        closeModal("#changePassModal")
    }


    //更改口令
    initChangeTokenData = async () => {
        const el = document.querySelector("#CHANGETOKEN")
        if (!(await initRequestData()) || !el) {
            el.onclick = () => createToast(t('toast_please_login'), 'red')
            el.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        el.style.backgroundColor = ''
        el.onclick = async () => {
            showModal('#changeTokenModal')
        }
    }
    initChangeTokenData()

    //更改口令
    const handleChangeToken = async (e) => {
        e.preventDefault()
        const form = e.target
        const formData = new FormData(form);
        const newToken = formData.get('newToken')
        const confirmToken = formData.get('confirmToken')
        const exp = /^(?=.*[a-zA-Z])(?=.*\d).{8,128}$/
        if (!newToken || newToken.trim() == '') return createToast(t('toast_please_input_new_token'), 'red')
        if (!confirmToken || confirmToken.trim() == '') return createToast(t('toast_please_input_new_conform_token'), 'red')
        if (newToken != confirmToken) return createToast(t('toast_token_not_eqal'), 'red')
        if (newToken.trim().length < 8) return createToast(t('toast_token_too_short'), 'red')
        if (!exp.test(newToken)) return createToast(t('toast_token_invalid'), 'red')
        try {
            try {
                const res = await (await fetchWithTimeout(`${KANO_baseURL}/set_token`, {
                    method: 'POST',
                    headers: common_headers,
                    body: JSON.stringify({
                        token: newToken.trim()
                    })
                })).json()
                if (res && res.result == 'success') {
                    createToast(t('toast_change_success'), 'green')
                    const new_token = SHA256(newToken.trim()).toLowerCase()
                    KANO_TOKEN = new_token
                    common_headers.authorization = KANO_TOKEN
                    localStorage.setItem('kano_sms_token', new_token)
                    form.reset()
                    const md = createModal({
                        name: "kano_token_confirm",
                        noBlur: true,
                        isMask: true,
                        title: t('remind_your_token'),
                        contentStyle: "font-size:12px",
                        onClose: () => {
                            return true
                        },
                        onConfirm: () => {
                            return true
                        },
                        content: `<div><p class="title" style="margin:6px 0">${t('remind_your_token_text')}</p><h1 onclick="copyText(event)" style="text-align:center">${newToken}</h1></div>`
                    })
                    closeModal('#changeTokenModal', 300, () => {
                        showModal(md.id)
                    })
                } else {
                    throw t('toast_change_failed')
                }
            } catch {
                createToast(t('toast_change_failed'), 'red')
            }
        } catch {
            createToast(t('toast_login_failed_check_network_and_pwd'), 'red')
            closeModal('#changeTokenModal')
        }
    }

    const onCloseChangeTokenForm = () => {
        const form = document.querySelector("#changeTokenForm")
        form && form.reset()
        closeModal("#changeTokenModal")
    }

    //sim卡切换
    let initSimCardType = async () => {
        let selectEl = document.querySelector('#SIM_CARD_TYPE')
        const { model } = await (await fetch(`${KANO_baseURL}/version_info`, { headers: common_headers })).json()
        if (model.toLowerCase() == 'v50') {
            selectEl = document.querySelector('#SIM_CARD_TYPE_V50')
        }

        //查询是否支持双卡
        // const { dual_sim_support } = await getData(new URLSearchParams({
        //     cmd: 'dual_sim_support'
        // }))
        // if (dual_sim_support && dual_sim_support == '0') {
        //     return
        // } else {
        selectEl.style.display = ''
        // }
        if (!(await initRequestData()) || !selectEl) {
            selectEl.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            selectEl.disabled = true
            return null
        }
        selectEl.style.backgroundColor = ''
        selectEl.disabled = false
        let res = await getData(new URLSearchParams({
            cmd: 'sim_slot'
        }))
        if (!selectEl || !res || res.sim_slot == null || res.sim_slot == undefined) {
            return
        }
        [...selectEl.children].forEach((item) => {
            if (item.value == res.sim_slot) {
                item.selected = true
            }
        })
        QOSRDPCommand("AT+CGEQOSRDP=1")
    }
    initSimCardType()

    //NFC切换
    let initNFCSwitch = async () => {
        const btn = document.querySelector('#NFC')
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        // 查询是否支持NFC
        try {
            const { is_support_nfc_functions } = await getData(new URLSearchParams({
                cmd: 'is_support_nfc_functions'
            }))
            if (!is_support_nfc_functions || Number(is_support_nfc_functions) == 0) {
                return
            } else {
                btn.style.display = ''
            }

            btn.style.backgroundColor = ''
            const { web_wifi_nfc_switch } = await getData(new URLSearchParams({
                cmd: 'web_wifi_nfc_switch'
            }))

            btn.onclick = async () => {
                try {
                    if (!(await initRequestData())) {
                        btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
                        return null
                    }
                    const cookie = await login()
                    if (!cookie) {
                        createToast(t('toast_login_failed_check_network'), 'red')
                        out()
                        return null
                    }
                    let res = await (await postData(cookie, {
                        goformId: 'WIFI_NFC_SET',
                        web_wifi_nfc_switch: web_wifi_nfc_switch.toString() == '1' ? '0' : '1'
                    })).json()
                    if (res.result == 'success') {
                        createToast(t('toast_oprate_success'), 'green')
                        initNFCSwitch()
                    } else {
                        createToast(t('toast_oprate_failed'), 'red')
                    }
                } catch (e) {
                    // createToast(e.message)
                }
            }

            btn.style.backgroundColor = web_wifi_nfc_switch.toString() == '1' ? 'var(--dark-btn-color-active)' : ''
        } catch { }
    }
    initNFCSwitch()

    let changeSimCard = async (e) => {
        const value = e.target.value.trim()
        if (!(await initRequestData()) || !value) {
            return null
        }
        createToast(t('toast_changing'), '#BF723F')
        try {
            const cookie = await login()
            if (!cookie) {
                createToast(t('toast_login_failed_check_network'), 'red')
                out()
                return null
            }
            let res = await (await postData(cookie, {
                goformId: 'SET_SIM_SLOT',
                sim_slot: value.trim()
            })).json()
            if (res.result == 'success') {
                createToast(t('toast_oprate_success'), 'green')
            } else {
                createToast(t('toast_oprate_failed'), 'red')
            }
            await initSimCardType()
            QOSRDPCommand("AT+CGEQOSRDP=1")
        } catch (e) {
            // createToast(e.message)
        }
    }


    // 控制测速请求的中断器
    let speedFlag = false;
    let speedController = null; // 可重置的变量

    async function startTest(e) {
        if (!(await initRequestData())) {
            createToast(t('toast_please_login'), 'red')
            return null
        }

        if (speedFlag) {
            speedController.abort();
            createToast(t('toast_speed_test_cancel'));
            return;
        }

        speedFlag = true;
        speedController = new AbortController();
        const speedSignal = speedController.signal;

        e.target.style.backgroundColor = 'var(--dark-btn-disabled-color)';
        e.target.innerHTML = t('speedtest_stop_btn');

        const serverUrl = `${KANO_baseURL}/speedtest`;

        const ckSize = document.querySelector('#speedTestModal #ckSize').value;
        const chunkSize = !isNaN(Number(ckSize)) ? Number(ckSize) : 1000;

        const resultDiv = document.getElementById('speedtestResult');

        const url = `${serverUrl}?ckSize=${chunkSize}&cors`;

        resultDiv.textContent = t('speedtest_running_btn');


        let totalBytes = 0;

        // 速度计算
        let lastBytes = 0;
        let lastTime = 0;

        // 滑动窗口
        const speedSamples = [];
        const MAX_SAMPLES = 5;

        let running = true;
        let renderPending = false;

        let currentSpeed = 0;


        function updateUI() {
            if (!running || renderPending) return;

            renderPending = true;

            requestAnimationFrame(() => {
                if (!running) {
                    renderPending = false;
                    return;
                }

                resultDiv.innerHTML = `
                ${t('speedtest_testing')}<br/>
                ${t('speedtest_total_download')}: ${(totalBytes / 1024 / 1024).toFixed(2)} MB<br/>
                ${t('speedtest_current_speed')}: ${currentSpeed.toFixed(2)} Mbps
            `;

                renderPending = false;
            });
        }


        try {

            const res = await fetch(url, {
                signal: speedSignal,
                headers: {
                    ...common_headers
                }
            });


            const reader = res.body.getReader();


            // 从真正开始收到数据计算
            const startTime = performance.now();
            lastTime = startTime;


            while (true) {

                const { done, value } = await reader.read();

                if (done) break;


                totalBytes += value.length;


                const now = performance.now();

                const elapsed = (now - lastTime) / 1000;


                // 每50ms采样
                if (elapsed >= 0.05) {


                    const deltaBytes = totalBytes - lastBytes;


                    const speed =
                        (deltaBytes * 8 / 1024 / 1024) / elapsed;


                    speedSamples.push(speed);


                    if (speedSamples.length > MAX_SAMPLES) {
                        speedSamples.shift();
                    }


                    currentSpeed =
                        speedSamples.reduce(
                            (a, b) => a + b,
                            0
                        ) / speedSamples.length;



                    lastBytes = totalBytes;
                    lastTime = now;


                    updateUI();
                }
            }


            running = false;


            const totalTime =
                (performance.now() - startTime) / 1000;


            const avgSpeed =
                ((totalBytes * 8) / 1024 / 1024) /
                totalTime;


            resultDiv.innerHTML += `
            <br/>✅ ${t('speedtest_done')}<br/>
            ${t('speedtest_total_time')}: ${totalTime.toFixed(2)} ${t('unit_seconds')}<br/>
            ${t('speedtest_avg_speed')}: ${avgSpeed.toFixed(2)} Mbps
        `;


        } catch (err) {

            running = false;

            if (err.name === 'AbortError') {

                resultDiv.innerHTML +=
                    `<br/>⚠️ ${t('speedtest_aborted')}`;

            } else {

                resultDiv.innerHTML =
                    `❌ ${t('speedtest_failed')}: ${err.message}`;
            }

        } finally {

            running = false;

            speedFlag = false;

            e.target.innerHTML =
                t('speedtest_start_btn');

            e.target.style.backgroundColor = '';

        }
    }

    //无限测速
    let loopSpeedTestTimer = null;
    const handleLoopMode = async (e) => {
        if (!(await initRequestData())) {
            createToast(t('please_login'), 'red');
            return null;
        }

        const speedTestButton = document.querySelector('#startSpeedBtn');
        const isStarting = e.target.innerHTML === t('loop_mode_start');

        if (isStarting) {
            e.target.innerHTML = t('loop_mode_stop');
            loopSpeedTestTimer && loopSpeedTestTimer();
            loopSpeedTestTimer = requestInterval(() => {
                if (speedTestButton && speedTestButton.innerHTML === t('speedtest_start')) {
                    speedTestButton.click();
                }
            }, 10);
        } else {
            loopSpeedTestTimer && loopSpeedTestTimer();
            if (speedTestButton && speedTestButton.innerHTML === t('speedtest_stop')) {
                speedTestButton.click();
            }
            e.target.innerHTML = t('loop_mode_start');
        }
    };

    // Read local raster images into data URLs without uploading them.
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        try {
            if (file.size > 10 * 1024 * 1024) throw new Error('Image exceeds 10 MB')
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.onerror = () => reject(reader.error)
                reader.readAsDataURL(file)
            })
            const url = getSafeLocalBackgroundUrl(dataUrl)
            if (!url) throw new Error('Unsupported image type')
            document.querySelector('#BG_INPUT').value = url
            localStorage.setItem('backgroundUrl', url)
            document.querySelector('#isCheckedBG').checked = true
            document.querySelector('#BG').style.backgroundImage = `url("${url}")`
            createToast(t('toast_upload_success'), 'green')
        } catch {
            createToast(t('privacy_background_notice'), 'red')
        } finally {
            event.target.value = ''
        }
    }

    // Promotional content is available only when opened manually.
    const onClosePayModal = () => {
        closeModal('#payModal')
        localStorage.setItem('hidePayAndGroupModal', 'true')
    }

    const handleClosePayModal = (e) => {
        if (e.target.id != 'payModal') return
        onClosePayModal()
    }

    //展开收起
    // 配置观察器_菜单
    (() => {
        const { el: collapseMenuEl } = createCollapseObserver(document.querySelector(".collapse_menu"))
        collapseMenuEl.dataset.name = localStorage.getItem('collapse_menu') || 'open'
        const collapseBtn = document.querySelector('#collapseBtn_menu')
        const switchComponent = createSwitch({
            value: collapseMenuEl.dataset.name == 'open',
            className: 'collapse_menu',
            onChange: (newVal) => {
                if (collapseMenuEl && collapseMenuEl.dataset) {
                    collapseMenuEl.dataset.name = newVal ? 'open' : 'close'
                    localStorage.setItem('collapse_menu', collapseMenuEl.dataset.name)
                }
            }
        });
        collapseBtn.appendChild(switchComponent);
    })();

    //展开收起
    // 配置观察器_基本状态
    collapseGen("#collapse_status_btn", "#collapse_status", "collapse_status")

    //展开收起
    // 配置观察器_TTYD
    collapseGen("#collapse_ttyd_btn", "#collapse_ttyd", "collapse_ttyd")

    //展开收起
    // 配置观察器_锁频
    collapseGen("#collapse_lkband_btn", "#collapse_lkband", "collapse_lkband")

    // 配置观察器_锁基站
    collapseGen("#collapse_lkcell_btn", "#collapse_lkcell", "collapse_lkcell", (isOpen) => {
        if (isOpen == 'open') {
            toggleLkcellOpen(true)
        } else {
            toggleLkcellOpen(false)
        }
    })

    //展开收起
    const collapse_lkcell_stor = localStorage.getItem('collapse_lkcell') || 'open'
    collapse_lkcell_stor == 'open' ? toggleLkcellOpen(true) : toggleLkcellOpen(false)

    // Updates are reviewed manually through the privacy fork releases page.
    // Opening this dialog does not contact an update server or install an APK.
    const initUpdateSoftware = () => {
        const btn = document.querySelector('#OTA')
        if (btn) btn.onclick = () => showModal('#updateSoftwareModal')
    }
    initUpdateSoftware()


    //adb轮询
    const adbQuery = async () => {
        try {
            const adb_status = await adbKeepAlive()
            const adb_text = adb_status ? `${t('network_adb_status')}：🟢 ${t('adb_status_active')}` : `${t('network_adb_status')}：🟡 ${t('adb_status_waiting')}`
            const version = window.UFI_DATA && window.UFI_DATA.cr_version ? window.UFI_DATA.cr_version : ''
            const adbSwitch = window.UFI_DATA && window.UFI_DATA.usb_port_switch == '1' ? true : false
            const adbStatusEl = document.querySelectorAll('.adb_status')
            if (adbStatusEl && adbStatusEl.length > 0) {
                adbStatusEl.forEach((item) => {
                    try {
                        item.innerHTML = adb_text + `<br/>${t('usb_debugging_status')}：${adbSwitch ? `${t('usb_debugging_active')}` : `${t('usb_debugging_inactive')}`}` + `<br/>${t('firmware_version')}：${version}`
                    } catch { }
                })
            }
        } catch { }
    }
    adbQuery()

    //执行shell脚本
    const handleShell = async () => {
        const AT_RESULT = document.querySelector('#AD_RESULT')
        let adb_status = await adbKeepAlive()
        if (!adb_status) {
            AT_RESULT.innerHTML = ""
            return createToast(t('toast_ADB_not_init'), 'red')
        }

        AT_RESULT.innerHTML = t('toast_running_please_wait')

        try {
            const res = await (await fetch(`${KANO_baseURL}/one_click_shell`, {
                headers: common_headers
            })).json()
            if (res) {
                if (res.error) {
                    AT_RESULT.innerHTML = res.error;
                    createToast(t('toast_exe_failed'), 'red');
                    return;
                }
                AT_RESULT.innerHTML = res.result;
                createToast(t('toast_exe_done'), 'green');
            } else {
                AT_RESULT.innerHTML = '';
                createToast(t('toast_exe_failed'), 'red');
            }
        } catch (e) {
            AT_RESULT.innerHTML = '';
            createToast(t('toast_exe_failed'), 'red');
        }

    }

    // SMS forwarding is unavailable in the privacy build.
    const initSmsForwardModal = () => disablePrivacyFeatureButton('#smsForward')
    const handleSmsForwardForm = disabledPrivacyFeature
    const handleSmsForwardCurlForm = disabledPrivacyFeature
    const handleSmsForwardDingTalkForm = disabledPrivacyFeature
    const switchSmsForwardMethodTab = disabledPrivacyFeature
    initSmsForwardModal()

    //别名设置
    let click_count_nickname = 1
    let nickname_timer = null
    const nicknameSettingClick = () => {
        nickname_timer && clearTimeout(nickname_timer)
        nickname_timer = setTimeout(() => {
            click_count_nickname = 1
        }, 1999)
        click_count_nickname++
        if (click_count_nickname <= 2) {
            return
        }
        click_count_nickname = 1
        openNicknameSetting()
    }

    const openNicknameSetting = async () => {
        try {
            //获取数据
            const { nickname, model } = await (await fetch(`${KANO_baseURL}/version_info`, {
                method: 'GET',
                headers: common_headers
            })).json()


            const { el, close } = createFixedToast('kano_nickname_set_toast', `
            <div style="pointer-events:all;width:80vw;max-width:400px">
            <div class="title" style="margin:0" data-i18n="forward_nickname_setting_btn">${t('forward_nickname_setting_btn')}</div>
            <input maxlength="255" id="kano_nickname_set_phone_list" class="input" style="padding:6px;margin:10px 0 5px 0;width: 100%;box-sizing: border-box;" placeholder="${model}">
            <div style="display:flex;gap:10px">
                <button id="confirm_nickname_set_setting_btn" style="width:100%;font-size:.64rem;margin-top:5px" data-i18n="submit_btn">${t("submit_btn")}</button>
                <button id="close_nickname_set_setting_btn" style="width:100%;font-size:.64rem;margin-top:5px" data-i18n="cancel_btn">${t("cancel_btn")}</button>
            </div>
            </div>
            `)
            const confirmBtn = el.querySelector("#confirm_nickname_set_setting_btn")
            const closeBtn = el.querySelector("#close_nickname_set_setting_btn")
            const nickNameEl = el.querySelector('#kano_nickname_set_phone_list')

            if (nickNameEl) {
                nickNameEl.value = nickname || ''
            }

            if (confirmBtn) {
                confirmBtn.onclick = async () => {
                    //提交
                    try {
                        const nickName = nickNameEl.value.trim()
                        const res = await (await fetch(`${KANO_baseURL}/set_nickname`, {
                            method: 'post',
                            body: JSON.stringify({
                                nickname: nickName
                            }),
                            headers: {
                                ...common_headers,
                                'Content-Type': 'application/json'
                            }
                        })).json()
                        if (!res.result && res.error) {
                            throw new Error(res.error)
                        }
                        if (res.result && res.result == 'success') {
                            createToast(t('toast_save_success'), 'pink')
                            loadTitle()
                        }
                    } catch (e) {
                        createToast(t('toast_save_failed'), 'red')
                    }
                    close()
                }
            }
            if (closeBtn) {
                closeBtn.onclick = () => {
                    close()
                }
            }
            showModal("#" + el.id)
        } catch (e) {
            createToast(t('client_mgmt_fetch_error'), 'red')
            console.error(e)
        }
    }
    const nicknameSettingBtn = document.querySelector('#forward_nickname_setting_btn')
    if (nicknameSettingBtn) {
        nicknameSettingBtn.onclick = openNicknameSetting
    }

    // OP
    const OP = (e) => {
        e.preventDefault()
        createToast(t('egg'), 'pink')
        closeModal('#TTYDModal')
        const TTYD = document.querySelector('#TTYD')
        if (!TTYD) return
        const title = TTYD.querySelector('.title strong')
        title && (title.innerHTML = "?")
        const list = TTYD.querySelector('.deviceList')
        list.innerHTML = `
        <li style = "padding:10px">
                    <p>${t('privacy_local_notice')}</p>
        </li > `
    }

    //内网设置
    const initLANSettings = async () => {
        const btn = document.querySelector('#LANManagement')
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            btn.style.backgroundColor = 'var(--dark-btn-disabled-color)'
            return null
        }
        btn.style.backgroundColor = 'var(--dark-btn-color)'
        btn.onclick = async () => {
            //获取当前局域网设置
            try {
                const res = await getData(new URLSearchParams({
                    cmd: 'lan_ipaddr,lan_netmask,mac_address,dhcpEnabled,dhcpStart,dhcpEnd,dhcpLease_hour,mtu,tcp_mss'
                }))
                if (res) {
                    const { lan_ipaddr, lan_netmask, dhcpEnabled, dhcpStart, dhcpEnd, dhcpLease_hour } = res
                    const form = document.querySelector('#LANManagementForm')
                    form.querySelector('input[name="lanIp"]').value = lan_ipaddr || ''
                    form.querySelector('input[name="lanNetmask"]').value = lan_netmask || ''
                    form.querySelector('input[name="dhcpStart"]').value = dhcpStart || ''
                    form.querySelector('input[name="dhcpEnd"]').value = dhcpEnd || ''
                    form.querySelector('input[name="dhcpLease"]').value = dhcpLease_hour.replace('h', '') || ''
                    form.querySelector('input[name="lanDhcpType"]').value = dhcpEnabled == '1' ? 'SERVER' : 'DISABLE'
                    // 设置开关状态
                    const collapse_dhcp = document.querySelector('#collapse_dhcp')
                    if (collapse_dhcp.dataset.name == 'open' && dhcpEnabled != '1') {
                        collapse_dhcp.dataset.name = 'close'
                    } else if (collapse_dhcp.dataset.name == 'close' && dhcpEnabled == '1') {
                        collapse_dhcp.dataset.name = 'open'
                    }

                } else {
                    createToast(t('toast_get_lan_setting_failed'), 'red')
                }
            } catch (e) {
                createToast(t('toast_get_lan_setting_failed'), 'red')
            }
            showModal('#LANManagementModal')
        }
    }
    initLANSettings()

    const onLANModalSubmit = async (e) => {
        e.preventDefault();
        try {
            const cookie = await login()
            if (!cookie) {
                createToast(t('toast_login_failed_check_network_and_pwd'), 'red')
                return null
            }

            const form = e.target; // 获取表单
            const formData = new FormData(form);

            let data = {
                lanIp: '192.168.0.1',
                lanNetmask: '255.255.255.0',
                lanDhcpType: 'DISABLE',
                dhcpStart: '',
                dhcpEnd: '',
                dhcpLease: '',
                dhcp_reboot_flag: '1',
                mac_ip_reset: '0',
            }

            // dhcp开关
            const lanDhcpType = formData.get('lanDhcpType') === 'SERVER';
            if (lanDhcpType) {
                data.lanDhcpType = 'SERVER';
                data.mac_ip_reset = '1';
            } else {
                data.lanDhcpType = 'DISABLE';
                data.mac_ip_reset = '0';
            }

            for (const [key, value] of formData.entries()) {
                const val = value.trim();
                switch (key) {
                    case 'lanIp':
                        if (!val || !isValidIP(val)) return createToast(t('toast_please_input_correct_lanIP'), 'red');
                        data[key] = val;
                        break;
                    case 'lanNetmask':
                        if (!val || !isValidSubnetMask(val)) return createToast(t('toast_please_input_correct_subnet_mask'), 'red');
                        data[key] = val;
                        break;
                    case 'dhcpStart': {
                        if (data.lanDhcpType == 'DISABLE') break
                        if (!val || !isValidIP(val)) return createToast(t('toast_please_input_correct_start_ip'), 'red');
                        const lanIp = formData.get('lanIp')?.trim();
                        const netmask = formData.get('lanNetmask')?.trim();
                        if (!isSameSubnet(val, lanIp, netmask)) {
                            return createToast('DHCP ' + t('toast_start_ip_not_include'), 'red');
                        }

                        if (ipToInt(val) <= ipToInt(lanIp)) {
                            return createToast('DHCP ' + t('toast_start_ip_should_bigger_than_lanIP'), 'red');
                        }
                        data[key] = val;
                        break;
                    }
                    case 'dhcpEnd': {
                        if (data.lanDhcpType == 'DISABLE') break
                        if (!val || !isValidIP(val)) return createToast(t('toast_invalid_end_ip'), 'red');
                        const start = formData.get('dhcpStart')?.trim();
                        const lanIp = formData.get('lanIp')?.trim();
                        const netmask = formData.get('lanNetmask')?.trim();

                        if (!isSameSubnet(val, lanIp, netmask)) {
                            return createToast('DHCP ' + t('toast_end_ip_not_in_subnet'), 'red');
                        }

                        if (start === val) return createToast(t('toast_start_equals_end_ip'), 'red');
                        if (ipToInt(start) > ipToInt(val)) return createToast(t('toast_start_greater_than_end_ip'), 'red');
                        data[key] = val;
                        break;
                    }
                    case 'dhcpLease':
                        if (data.lanDhcpType == 'DISABLE') break
                        if (Number(val) <= 0) return createToast(t('toast_invalid_lease_time'), 'red');
                        data[key] = val;
                        break;
                    default:
                        break;
                }
            }

            const lanIp = formData.get('lanIp')?.trim();
            const netmask = formData.get('lanNetmask')?.trim();
            if (isValidIP(lanIp) && isValidSubnetMask(netmask)) {
                const dhcpStart = formData.get('dhcpStart')?.trim();
                const dhcpEnd = formData.get('dhcpEnd')?.trim();
                const networkAddr = getNetworkAddress(lanIp, netmask);
                const broadcastAddr = getBroadcastAddress(lanIp, netmask);

                // 网关 IP 不能是网络地址或广播地址
                if (lanIp === networkAddr || lanIp === broadcastAddr) {
                    return createToast(t('toast_gateway_is_network_or_broadcast'), 'red');
                }

                // DHCP 起始或结束地址不能是网络地址或广播地址
                if (dhcpStart === networkAddr || dhcpStart === broadcastAddr) {
                    return createToast('DHCP ' + t('toast_start_ip_is_network_or_broadcast'), 'red');
                }

                if (dhcpEnd === networkAddr || dhcpEnd === broadcastAddr) {
                    return createToast('DHCP ' + t('toast_end_ip_is_network_or_broadcast'), 'red');
                }

                // 网关地址不能落在 DHCP 分配范围内
                const lanInt = ipToInt(lanIp);
                const startInt = ipToInt(dhcpStart);
                const endInt = ipToInt(dhcpEnd);
                if (lanInt >= startInt && lanInt <= endInt) {
                    return createToast(t('toast_gateway_in_dhcp_range'), 'red');
                }
            }

            const res = await (await postData(cookie, {
                goformId: 'DHCP_SETTING',
                ...data
            })).json()

            if (res.result == 'success') {
                createToast(t('toast_set_success_reboot'), 'green')
                closeModal('#LANManagementModal')
                setTimeout(() => {
                    //循环等待
                    let newURL = 'http://' + data.lanIp + ':2333'
                    window.location.href = newURL
                }, 30000);
            } else {
                throw t('toast_set_failed')
            }
        }
        catch (e) {
            console.error(e.message)
            // createToast(e.message)
        }
    }

    collapseGen("#collapse_dhcp_switch", "#collapse_dhcp", null, async (status) => {
        const enableDHCP = document.querySelector('#enableDHCP')
        if (!enableDHCP) return
        enableDHCP.value = status == 'open' ? "SERVER" : "DISABLE"
    })

    //设备监控
    collapseGen("#collapse_device_mon_btn", "#collapse_device_mon", 'collapse_device_mon', async (status) => {
    })

    //改变刷新频率
    const changeRefreshRate = (e) => {
        const value = e.target.value
        if (value) {
            stopRefresh()
            REFRESH_TIME = value
            startRefresh()
            createToast(t('toast_current_refresh_rate') + "：" + (value / 1000).toFixed(2) + "S")
            //保存
            localStorage.setItem("refreshRate", value)
        }
    }

    //开关小核心
    const switchCpuCore = async (flag = true) => {
        const AD_RESULT = document.querySelector('#AD_RESULT')
        const shell = `
echo ${flag ? '1' : '0'} > /sys/devices/system/cpu/cpu0/online
echo ${flag ? '1' : '0'} > /sys/devices/system/cpu/cpu1/online
echo ${flag ? '1' : '0'} > /sys/devices/system/cpu/cpu2/online
echo ${flag ? '1' : '0'} > /sys/devices/system/cpu/cpu3/online
        `
        const result = await runShellWithRoot(shell)
        result.success ? createToast(t('toast_exe_success'), 'green') : createToast(t('toast_exe_failed'), 'red')

        AD_RESULT.innerHTML = result.content

    }

    // Scheduled tasks are unavailable in the privacy build.
    const initScheduledTask = () => disablePrivacyFeatureButton('#ScheduledTaskManagement')
    const refreshTask = disabledPrivacyFeature
    const addTask = disabledPrivacyFeature
    const editTask = disabledPrivacyFeature
    const handleSubmitTask = disabledPrivacyFeature
    const closeAddTask = disabledPrivacyFeature
    const fillAction = disabledPrivacyFeature
    initScheduledTask()

    // Plugins and custom head markup are unavailable in the privacy build.
    const initPluginSetting = () => disablePrivacyFeatureButton('#PLUGIN_SETTING')
    const handlePluginFileUpload = disabledPrivacyFeature
    const exportPlugin = disabledPrivacyFeature
    const pluginExport = disabledPrivacyFeature
    const onPluginBtn = disabledPrivacyFeature
    const clearPluginText = disabledPrivacyFeature
    const savePluginSetting = disabledPrivacyFeature
    initPluginSetting()

    const handleDisableFOTA = async () => {
        const AD_RESULT = document.querySelector('#AD_RESULT')
        try {
            //看看是不是开启了高级功能
            AD_RESULT.innerHTML = `<strong class="green" style="font-size: 12px;">${t('disable_update_ing')}...</strong>`
            if (await checkAdvancedFunc()) {
                createToast(t('toast_advanced_checked'), '')
                let res0 = await runShellWithRoot("pm disable com.zte.zdm")
                let res1 = await runShellWithRoot("pm uninstall -k --user 0 com.zte.zdm ")
                let res2 = await runShellWithRoot("pm uninstall -k --user 0 cn.zte.aftersale")
                let res3 = await runShellWithRoot("pm uninstall -k --user 0 com.zte.zdmdaemon")
                let res4 = await runShellWithRoot("pm uninstall -k --user 0 com.zte.zdmdaemon.install")
                let res5 = await runShellWithRoot("pm uninstall -k --user 0 com.zte.analytics")
                let res6 = await runShellWithRoot("pm uninstall -k --user 0 com.zte.neopush")
                let res7 = await runShellWithRoot("am force-stop com.zte.zdm")
                AD_RESULT.innerHTML = `
                <div style="min-width:200px;font-size:12px">
                <p>${t('advanced_checked_disabled_update')}</p>
                <p>${res0.content}</p>
                <p>${res1.content}</p>
                <p>${res2.content}</p>
                <p>${res3.content}</p>
                <p>${res4.content}</p>
                <p>${res5.content}</p>
                <p>${res6.content}</p>
                <p>${res7.content}</p>
                </div>`
            } else {
                createToast(t('toast_not_enabled_advanced_tools'), '')
                let adb_status = await adbKeepAlive()
                if (!adb_status) {
                    AT_RESULT.innerHTML = ""
                    return createToast(t('toast_ADB_not_init'), 'red')
                }
                const res = await (await fetchWithTimeout(`${KANO_baseURL}/disable_fota`, {
                    method: 'get',
                    headers: common_headers
                })).json()
                if (!res.error) {
                    createToast(t('update_has_disabled'), 'green')
                    AD_RESULT.innerHTML = `<strong class="green" style="font-size: 12px;">${t('use_adb_to_disabled_update')}</strong>`
                } else {
                    createToast(t('update_disabled_failed'), 'red')
                    AD_RESULT.innerHTML = `<strong class="red" style="font-size: 12px;">${t('update_disabled_failed')}</strong>`
                }
            }
        } catch (e) {
            console.error(e)
            AD_RESULT.innerHTML = `<strong class="red" style="font-size: 12px;">${t('update_disabled_failed')}</strong>`
            createToast(t('error'), 'red')
        }
    }

    const getBoot = async () => {
        try {
            const AD_RESULT = document.querySelector('#AD_RESULT')
            AD_RESULT.innerHTML = ''
            const res = await runShellWithRoot("getprop ro.boot.slot_suffix")
            let ab = res.content.includes('a') ? "A" : "B"
            createToast(`${t('your_boot_slot')}：${ab}`, '')
            await runShellWithRoot('mkdir /data/data/com.minikano.f50_sms/files/uploads')
            const outFile = `boot_${ab.toLowerCase()}.img`
            await runShellWithRoot(`rm -f /data/data/com.minikano.f50_sms/files/uploads/${outFile}`)
            const command = `dd if=/dev/block/by-name/boot_${ab.toLowerCase()} of=/data/data/com.minikano.f50_sms/files/uploads/${outFile}`
            let result = await runShellWithRoot(command)
            if (result.success) {
                AD_RESULT.innerHTML = `<strong style="font-size: 12px;">${t('your_boot_slot')}：${ab}，${t('downloading')}：boot_${ab}.img...</strong>`
            }
            //开始下载
            const outLink = `/api/uploads/${outFile}`
            const a = document.createElement('a')
            a.href = outLink
            a.download = outFile
            a.click()
        } catch {
            createToast(t("error"), 'red')
        }
    }

    // External proxy speed tests are unavailable; the local speed test remains.
    const initCellularSpeedTestBtn = () => disablePrivacyFeatureButton('#CellularSpeedTestBtn')
    const runSingleTest = disabledPrivacyFeature
    const startCellularTestRealtime = disabledPrivacyFeature
    const handleCellularLoopMode = disabledPrivacyFeature
    const closeCellularTest = () => closeModal('#CellularTestModal')
    const onThreadNumChange = disabledPrivacyFeature
    const saveCellularTestUrl = disabledPrivacyFeature
    initCellularSpeedTestBtn()

    const installPluginFromStore = disabledPrivacyFeature
    const handlePluginStoreSearchInput = disabledPrivacyFeature
    const saveCustomRepo = disabledPrivacyFeature
    const resetCustomRepo = disabledPrivacyFeature

    const handleForceIMEI = async () => {
        if (!await checkAdvancedFunc()) return createToast(t("need_advance_func"), 'red')
        const AT_RESULT = document.querySelector('#AT_RESULT')
        if (AT_RESULT) {
            AT_RESULT.innerHTML = t('toast_running_please_wait')
            try {
                const res = await runShellWithRoot(`/data/data/com.minikano.f50_sms/files/imei_reader`)
                //清空imei展示缓存
                resetDiagImeiCache()
                AT_RESULT.innerHTML = `<p style="font-weight:bolder;overflow:hidden" onclick="copyText(event)">${res.content.replaceAll('\n', "<br>")}</p>`
            } catch {
                AT_RESULT.innerHTML = ""
            }
        }
    }

    const getSELinuxStatus = async () => {
        try {
            const res = await (await fetchWithTimeout(`${KANO_baseURL}/SELinux`)).json()
            let result = res.selinux.toLowerCase()
            if (result !== "permissive" && result !== "disabled" && result != "0") {
                createToast(t('not_support_firmware'), "pink", 10000);
            }
        } catch {
        }
    }
    getSELinuxStatus()

    const initCheckWeakToken = async () => {
        if (!(await initRequestData())) {
            return null
        }

        if (await checkWeakToken()) {
            const stor_name = 'weakTokenToastLater'
            const threeDaysMill = 259200000
            try {
                const now_exp = localStorage.getItem(stor_name)
                if (now_exp) {
                    if (now_exp - Date.now() > 0) {
                        const t = new Date(now_exp - Date.now())
                        console.log(`弱口令弹窗还剩：${t.getTime() / 1000 / 60 / 60 / 24} 天`);
                        //三天内不提示
                        return
                    }
                } else {
                    throw new Error("now_exp为空")
                }
            } catch {
                console.error("weakTokenToastLater格式不合法,即将删除此stor");
                localStorage.removeItem(stor_name)
            }
            const { el, close } = createFixedToast('weak_token_toast', `
                <div style="pointer-events:all;width:80vw;max-width:300px;">
                <div class="title" style="margin:0" data-i18n="system_notice">${t('system_notice')}</div>
                <p>${t("weak_token_detected")}</p>
                <div style="display:flex;gap:10px">
                    <button id="close_weak_token_toast_btn" style="width:100%;font-size:.64rem;margin-top:5px" data-i18n="change_token_now">${t("change_token_now")}</button>
                    <button id="close_3_days_weak_token_toast_btn" style="width:100%;font-size:.64rem;margin-top:5px" data-i18n="three_days_later">${t("three_days_later")}</button>
                </div>
                </div>
                `, 'red')
            const btn = el.querySelector('#close_weak_token_toast_btn')
            const btn3Days = el.querySelector('#close_3_days_weak_token_toast_btn')

            if (!btn) {
                close()
                return
            }
            btn.onclick = () => {
                close()
                showModal("#changeTokenModal")
            }

            if (!btn3Days) {
                close()
                return
            }
            btn3Days.onclick = () => {
                localStorage.setItem(stor_name, Date.now() + threeDaysMill)
                createToast(t('three_days_later_info'))
                close()
            }
        }
    }
    initCheckWeakToken()

    const togglePort = async (port, flag, isBootup = false, v6 = false) => {
        try {
            if (!await checkAdvancedFunc()) {
                createToast(t("need_advance_func"), 'red');
                return false;
            }

            const addCmd = (useV6) => {
                const bin = useV6 ? 'ip6tables' : 'iptables';
                return `${bin} -A INPUT -p tcp --dport ${port} -j DROP`;
            };

            const delCmd = (useV6) => {
                const bin = useV6 ? 'ip6tables' : 'iptables';
                return `${bin} -D INPUT -p tcp --dport ${port} -j DROP`;
            };

            // 删除当前系统中的 DROP 规则
            const cleanupCmd = (useV6) => {
                const bin = useV6 ? 'ip6tables' : 'iptables';
                return `for table in filter nat mangle raw security; do ${bin}-save -t $table 2>/dev/null | grep -- '--dport ${port} .*DROP' | sed 's/-A/-D/' | while read line; do ${bin} $line 2>/dev/null; done; done`;
            };

            const saveBootup = async (cmd, proto) => {
                const line = `(${cmd} >/dev/null 2>&1 &) # UFI-TOOLS ${proto} ${port}`;
                const shell = `grep -qxF '${line}' /sdcard/ufi_tools_boot.sh 2>/dev/null || echo '${line}' >> /sdcard/ufi_tools_boot.sh`;
                await runShellWithRoot(shell);
            };

            const removeAllBootup = async () => {
                await runShellWithRoot(`sed -i '/# UFI-TOOLS .* ${port}/d' /sdcard/ufi_tools_boot.sh 2>/dev/null`);
            };

            // 先清理当前系统旧规则，避免重复
            let r0 = await runShellWithRoot(cleanupCmd(false));
            if (!r0.success) return false;

            if (v6) {
                let r0v6 = await runShellWithRoot(cleanupCmd(true));
                if (!r0v6.success) return false;
            }

            // 当前系统立即生效
            if (flag) {
                // flag=true：放行端口
                // 前面 cleanup 已经删除 DROP，这里不需要再 -D
            } else {
                // flag=false：阻止端口
                let r1 = await runShellWithRoot(addCmd(false));
                if (!r1.success) return false;

                if (v6) {
                    let r1v6 = await runShellWithRoot(addCmd(true));
                    if (!r1v6.success) return false;
                }
            }

            // 开机脚本持久化
            await removeAllBootup();

            if (isBootup) {
                if (flag) {
                    // 开机后放行：删除 DROP
                    await saveBootup(delCmd(false), 'v4');
                    if (v6) await saveBootup(delCmd(true), 'v6');
                } else {
                    // 开机后阻止：添加 DROP
                    await saveBootup(addCmd(false), 'v4');
                    if (v6) await saveBootup(addCmd(true), 'v6');
                }
            }

            return true;
        } catch (e) {
            createToast(e);
            return false;
        }
    };

    const port_iptables = document.querySelector('#port_iptables')
    const dev_bootup = document.querySelector("#dev_bootup")
    const dev_ipv6 = document.querySelector("#dev_ipv6")

    const toggleTTYD = async (flag) => {
        if (!await checkAdvancedFunc()) return createToast(t("need_advance_func"), 'red')
        const bootUp = dev_bootup.checked
        const v6 = dev_ipv6.checked
        const res = togglePort("1146", flag, bootUp, v6)
        if (!res) createToast(t("toast_oprate_failed"), "red")
        createToast(t("toast_oprate_success"), 'green')
    }

    const toggleADBIP = async (flag) => {
        if (!await checkAdvancedFunc()) return createToast(t("need_advance_func"), 'red')
        const bootUp = dev_bootup.checked
        const v6 = dev_ipv6.checked
        const res = togglePort("5555", flag, bootUp, v6)
        if (!res) createToast(t("toast_oprate_failed"), "red")
        createToast(t("toast_oprate_success"), 'green')
    }

    const toggleLogCat = async (flag) => {
        try {
            const { result } = await (await fetchWithTimeout(`${KANO_baseURL}/set_log_status`, {
                method: "POST",
                headers: common_headers,
                body: JSON.stringify({ debug_log_enabled: flag ? true : false })
            })).json()
            if (result.success) {
                throw new Error('Failed to toggle LogCat')
            }
            createToast(t("toast_oprate_success"), 'green')
        }
        catch {
            if (!res) createToast(t("toast_oprate_failed"), "red")
        }
    }

    const toggleWakeLock = async (flag) => {
        try {
            const { result } = await (await fetchWithTimeout(`${KANO_baseURL}/set_wakelock_status`, {
                method: "POST",
                headers: common_headers,
                body: JSON.stringify({ wakelock_enabled: flag ? true : false })
            })).json()
            if (result.success) {
                throw new Error('Failed to set_wakelock_status')
            }
            createToast(t("toast_oprate_success"), 'green')
        }
        catch {
            if (!res) createToast(t("toast_oprate_failed"), "red")
        }
    }

    const resetTTYDPort = () => {
        const port = localStorage.getItem('ttyd_port')
        if (port != '1146') {
            localStorage.setItem('ttyd_port', '1146')
            initTTYD && initTTYD()
            createToast(t('toast_oprate_success'), '')
        }
    }
    let clearUppBtnCounter = 0
    let clearUppBtnTimer = null
    const clearAPPUploadData = async () => {
        clearUppBtnCounter++
        if (clearUppBtnCounter <= 3) {
            clearUppBtnTimer && clearTimeout(clearUppBtnTimer)
            clearUppBtnTimer = setTimeout(() => {
                clearUppBtnCounter = 0
            }, 5000);
            return createToast('Click {num} times to confirm'.replace('{num}', (4 - clearUppBtnCounter)), 'pink', 3000)
        }
        clearUppBtnCounter = 0

        const res = await fetchWithTimeout(`${KANO_baseURL}/delete_all_uploads_data`, {
            method: 'post',
            headers: common_headers
        })
        const { result, deleted_list } = await res.json()
        if (result != "success") {
            createToast(t("toast_oprate_failed"), "red")
            return
        }
        if (deleted_list) {
            let listString = ''
            for (let key in deleted_list) {
                listString += `${key}: <b>${deleted_list[key] ? 'OK' : "FAILED"}</b><br>`
            }
            if (listString.trim() == '') {
                createToast(t('toast_oprate_success'), '')
                return
            }
            const { el, close } = createFixedToast('kano_del_appdata_success', `
                <div style="pointer-events:all;width:80vw;max-width:400px;">
                <div class="title" style="margin:0" data-i18n="system_notice">${t('system_notice')}</div>
                <p>${listString}</p>
                <div style="display:flex;gap:10px">
                    <button id="confirm_kano_del_appdata_toast_btn" style="width:100%;font-size:.64rem;margin-top:5px" data-i18n="close_btn">${t("close_btn")}</button>
                </div>
                </div>
                `, 'red')
            const close_btn = el.querySelector("#confirm_kano_del_appdata_toast_btn")

            if (close_btn) {
                close_btn.onclick = () => {
                    close()
                }
            }
        } else {
            createToast(t('toast_oprate_success'), '')
        }
    }

    const setPort = async (flag) => {
        if (!await checkAdvancedFunc()) return createToast(t("need_advance_func"), 'red')
        const port = port_iptables.value
        const bootUp = dev_bootup.checked
        const v6 = dev_ipv6.checked
        if (!port) return createToast("Please input a valid port (1 - 65535)")
        const res = await togglePort(port, flag, bootUp, v6)
        if (!res) createToast(t("toast_oprate_failed"), "red")
        createToast(t("toast_oprate_success"), 'green')
    }

    //高铁模式
    handleHighRailMode = async (e) => {
        if (!(await initRequestData())) {
            return null
        }
        const HighRailModeAT = "AT+SP5GCMDS=\"set nr param\",35,"
        const target = e.target
        const isEnabled = target.dataset.enabled === '1'
        try {
            if (isEnabled) {
                //关闭高铁模式
                const res = await handleAT(HighRailModeAT + "0", true)
                if (!res) throw new Error('Failed to enable High Rail Mode')
                target.dataset.enabled = '0'
                target.style.backgroundColor = ''
            } else {
                //开启高铁模式
                const res = await handleAT(HighRailModeAT + "1", true)
                if (!res) throw new Error('Failed to enable High Rail Mode')
                target.dataset.enabled = '1'
                target.style.backgroundColor = 'var(--dark-btn-color-active)'
            }
            createToast(t("toast_oprate_success_reboot"), 'green')
        } catch {
            createToast(t('toast_exe_failed'), 'red')
        }
    }

    //初始化休眠选项卡     
    const initSleepTime = async () => {
        const target = document.querySelector("#SLEEP_TIME")
        if (!target) return
        if (!(await initRequestData())) {
            target.disabed = true
            target.style.background = "var(--dark-btn-disabled-color)"
            return null
        }
        target.disabed = false
        target.style.background = ""
        // 从设备获取数据
        const { sleep_sysIdleTimeToSleep } = await getData(new URLSearchParams({
            cmd: "sleep_sysIdleTimeToSleep"
        }))
        if (sleep_sysIdleTimeToSleep == "") {
            target.style.display = 'none'
        } else {
            target.style.display = ''
        }
        target.value = sleep_sysIdleTimeToSleep

    }
    initSleepTime()

    const changeSleepTime = async (e) => {
        if (!(await initRequestData())) {
            createToast(t("toast_need_login"), 'red');
            e.preventDefault()
            return false;
        }
        const target = e.target
        if (!target) return

        try {

            const res = await postData(await login(), {
                goformId: "SET_WIFI_SLEEP_INFO",
                sleep_sysIdleTimeToSleep: target.value
            })

            const { result } = await res.json()

            if (result != "success") {
                throw new Error("fail!")
            }

            createToast(t('toast_oprate_success'), 'green')
            initSleepTime()
        } catch {
            createToast(t('toast_oprate_failed'), 'red')
        }
    }

    //初始化APN信息框内容
    const renderAPNViewModalContet = (res = {}) => {
        // 信息框初始化
        const APNViewModal = document.querySelector('#APNViewModal')
        if (APNViewModal) {
            const profileNameEl = APNViewModal.querySelector('input[name="profile_name"]')
            const apnEl = APNViewModal.querySelector('input[name="apn"]')
            const unameEl = APNViewModal.querySelector('input[name="username"]')
            const pwdEl = APNViewModal.querySelector('input[name="password"]')
            const authMethodEl = APNViewModal.querySelector('input[name="auth_method"]')
            const pdpMethodEl = APNViewModal.querySelector('input[name="pdp_method"]')

            if (profileNameEl) {
                profileNameEl.value = res.apn_m_profile_name || res.m_profile_name || res.profile_name
            }
            if (apnEl) {
                apnEl.value = res.apn_wan_apn || res.apn_ipv6_wan_apn
            }
            if (unameEl) {
                unameEl.value = res.ppp_username_ui || res.apn_ppp_username
            }
            if (pwdEl) {
                pwdEl.value = res.ppp_passwd_ui || res.apn_ppp_passwd
            }
            if (authMethodEl) {
                authMethodEl.value = res.ppp_auth_mode_ui.toLowerCase() || res.apn_ppp_auth_mode.toLowerCase()
            }
            if (pdpMethodEl) {
                pdpMethodEl.value = res.apn_pdp_type
            }
        }
    }

    //初始化APN修改框内容
    const renderAPNEditModalContet = (res = {}) => {
        // 信息框初始化
        const APNEditModal = document.querySelector('#APNEditModal')
        if (APNEditModal) {
            const profileNameEl = APNEditModal.querySelector('input[name="profile_name"]')
            const apnEl = APNEditModal.querySelector('input[name="apn"]')
            const unameEl = APNEditModal.querySelector('input[name="username"]')
            const pwdEl = APNEditModal.querySelector('input[name="password"]')
            const authMethodEl = APNEditModal.querySelector('select[name="auth_method"]')
            const pdpMethodEl = APNEditModal.querySelector('select[name="pdp_method"]')

            if (profileNameEl) {
                profileNameEl.value = res.apn_m_profile_name || res.m_profile_name || res.profile_name
            }
            if (apnEl) {
                apnEl.value = res.apn_wan_apn || ""
            }
            if (unameEl) {
                unameEl.value = res.apn_ppp_username || ""
            }
            if (pwdEl) {
                pwdEl.value = res.apn_ppp_passwd || ""
            }
            if (authMethodEl) {
                authMethodEl.value = res.apn_ppp_auth_mode.toLowerCase()
            }
            if (pdpMethodEl) {
                pdpMethodEl.value = res.apn_pdp_type
            }
        }
    }

    //APN手动与自动切换的点击事件
    const onChangeIsAutoFrofile = async (flag) => {
        const autoProfileEl = document.querySelector('#APNManagementForm #autoProfileEl')
        const profileEl = document.querySelector('#APNManagementForm #profileEl')
        if (autoProfileEl && profileEl) {
            if (flag) {
                autoProfileEl.style.display = ""
                profileEl.style.display = "none"
            } else {
                autoProfileEl.style.display = "none"
                profileEl.style.display = ""
            }
        }
    }

    // APN 编辑框数据提取
    const getAPNEditFormData = ({ index = 0 }) => {
        const APNEditModal = document.querySelector('#APNEditModal')

        if (!APNEditModal) return null
        if (index == null || index == undefined) return null
        const profileNameEl = APNEditModal.querySelector('input[name="profile_name"]') || {}
        const apnEl = APNEditModal.querySelector('input[name="apn"]') || {}
        const unameEl = APNEditModal.querySelector('input[name="username"]') || {}
        const pwdEl = APNEditModal.querySelector('input[name="password"]') || {}
        const authMethodEl = APNEditModal.querySelector('select[name="auth_method"]') || {}
        const pdpMethodEl = APNEditModal.querySelector('select[name="pdp_method"]') || {}

        if (!profileNameEl.value.trim() || !apnEl.value.trim()) {
            return null
        }

        const baseProfile = {
            "profile_name": profileNameEl.value ? profileNameEl.value.trim() : "",
            "wan_dial": "*99#",
            "apn_wan_dial": "*99#",
            "apn_select": "manual",
            "apn_pdp_type": pdpMethodEl.value ? pdpMethodEl.value : "IPv4v6",
            "pdp_type": pdpMethodEl.value ? pdpMethodEl.value : "IPv4v6",
            "apn_pdp_select": "auto",
            "apn_pdp_addr": "",
            "pdp_select": "auto",
            "pdp_addr": "",
            "index": index,
        }

        const v4Profile = {
            "apn_wan_apn": apnEl.value ? apnEl.value.trim() : "",
            "apn_ppp_auth_mode": authMethodEl.value ? authMethodEl.value : "none",
            "apn_ppp_username": unameEl.value ? unameEl.value.trim() : "",
            "apn_ppp_passwd": pwdEl.value ? pwdEl.value.trim() : "",
            "wan_apn": apnEl.value ? apnEl.value.trim() : "",
            "ppp_auth_mode": authMethodEl.value ? authMethodEl.value : "none",
            "ppp_username": unameEl.value ? unameEl.value.trim() : "",
            "ppp_passwd": pwdEl.value ? pwdEl.value.trim() : "",
            "dns_mode": "auto",
            "prefer_dns_manual": "",
            "standby_dns_manual": "",
        }
        const v6Profile = {
            "apn_ipv6_wan_apn": apnEl.value ? apnEl.value.trim() : "",
            "apn_ipv6_ppp_auth_mode": authMethodEl.value ? authMethodEl.value : "none",
            "apn_ipv6_ppp_username": unameEl.value ? unameEl.value.trim() : "",
            "apn_ipv6_ppp_passwd": pwdEl.value ? pwdEl.value.trim() : "",
            "ipv6_wan_apn": apnEl.value ? apnEl.value.trim() : "",
            "ipv6_ppp_auth_mode": authMethodEl.value ? authMethodEl.value : "none",
            "ipv6_ppp_username": unameEl.value ? unameEl.value.trim() : "",
            "ipv6_ppp_passwd": pwdEl.value ? pwdEl.value.trim() : "",
            "ipv6_dns_mode": "auto",
            "ipv6_prefer_dns_manual": "",
            "ipv6_standby_dns_manual": "",
        }
        if (pdpMethodEl.value == "IPv6") {
            return {
                ...baseProfile,
                ...v6Profile
            }
        }

        if (pdpMethodEl.value == "IP") {
            return {
                ...baseProfile,
                ...v4Profile
            }
        }

        if (pdpMethodEl.value == "IPv4v6") {
            return {
                ...baseProfile,
                ...v4Profile,
                ...v6Profile
            }
        }

        return null
    }

    // APN设置
    const initAPNManagement = async () => {
        const btn = document.querySelector('#APNManagement')
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            btn.style.background = "var(--dark-btn-disabled-color)"
            return null
        }
        btn.style.background = ""
        const renderData = async () => {
            showModal('#APNManagementModal')
            // 加载数据
            const res = await getAPNData()

            const APNManagementFormEl = document.querySelector('#APNManagementForm')
            const APNManagementForm = document.querySelector('#APNManagementForm .content')
            if (!APNManagementForm) return

            const autoProfileEl = APNManagementForm.querySelector('#autoProfileEl')
            const profileEl = APNManagementForm.querySelector('#profileEl')
            if (autoProfileEl && profileEl) {
                if (res.apn_mode == "auto") {
                    autoProfileEl.style.display = ""
                    profileEl.style.display = "none"
                } else {
                    autoProfileEl.style.display = "none"
                    profileEl.style.display = ""
                }
            }

            const currentAPNEl = APNManagementForm.querySelector('span[name="apn_wan_apn"]')
            if (currentAPNEl) currentAPNEl.textContent = res.apn_wan_apn + ` (${res.profile_name || res.m_profile_name || res.profile_name_ui})`

            const autoApnModeEl = APNManagementForm.querySelector('#autoAPNMode')
            const apnModeEl = APNManagementForm.querySelector('#apnMode')
            if (apnModeEl) {
                if (res.apn_mode == "auto") {
                    autoApnModeEl.checked = true
                } else {
                    apnModeEl.checked = true
                }
            }

            const autoProfile = APNManagementForm.querySelector('#autoProfile')
            if (autoProfile) {
                const option = document.createElement('option')
                option.value = res.apn_auto_profile
                option.textContent = res.apn_m_profile_name || res.m_profile_name || res.profile_name
                autoProfile.innerHTML = res.apn_m_profile_name || res.m_profile_name || res.profile_name
                autoProfile.appendChild(option)
            }

            //手动配置文件下拉列表渲染
            const profile = APNManagementForm.querySelector('select[name="profile"]')

            if (profile) {
                let selectedIndex = -1
                profile.selectedIndex =
                    profile.innerHTML = ''
                for (let i = 0; i < 20; i++) {
                    if (!res["APN_config" + i]) continue
                    const configs = res["APN_config" + i].split('($)')
                    const configs_v6 = res["ipv6_APN_config" + i]
                    if (configs && configs.length) {
                        const option = document.createElement('option')
                        option.value = configs[0] //第一个值为APN名称
                        option.textContent = configs[0]
                        profile.appendChild(option)
                        // 选择当前使用的配置
                        if (configs[0] == (res.m_profile_name || res.profile_name)) {
                            selectedIndex = i
                        }
                    }
                }
                if (selectedIndex == -1) {
                    selectedIndex = profile.querySelectorAll('option').length - 1
                }
                profile.selectedIndex = selectedIndex
            }

            //渲染APN列表（预览）
            renderAPNViewModalContet(res)

            //保存profile
            const onSaveProfile = (method = "add") => {
                return async (e) => {
                    e.preventDefault()
                    if (!(await initRequestData())) {
                        createToast(t("toast_need_login"), 'red');
                        return false;
                    }

                    const manualProfileEl = APNManagementForm.querySelector('#manualProfile')

                    let index = manualProfileEl.selectedIndex

                    // 如果是添加配置的话，index应该是列表总数(+1)
                    if (method == "add") {
                        const options = APNManagementForm.querySelectorAll('#manualProfile option')
                        if (options.length) {
                            index = options.length
                        }
                    }

                    const formData = getAPNEditFormData({ index })

                    if (!formData) {
                        createToast(t("please_input_full_profile"), 'red')
                        return
                    }

                    try {
                        const res = await saveAPNProfile(formData)
                        if (res.result == "success") {
                            createToast(t('toast_save_success'), 'green')
                            closeModal('#APNEditModal', 300, () => {
                                showModal('#APNManagementModal')
                                // 重新加载
                                renderData()
                            })
                        } else {
                            createToast(t('toast_save_failed'), 'red')
                        }
                    } catch (e) {
                        createToast(t('toast_save_failed'), 'red')
                    }
                }
            }

            // 手动模式
            // 绑定添加的事件
            const addAPNBtn = APNManagementForm.querySelector('#addAPNProfile')
            if (addAPNBtn) addAPNBtn.onclick = async (e) => {
                e.preventDefault()
                const title = document.querySelector('#APNEditModal #APN_MOD_TITLE')
                if (title) title.textContent = t("add_apn")
                if (!(await initRequestData())) {
                    createToast(t("toast_need_login"), 'red');
                    return false;
                }
                closeModal('#APNManagementModal', 300, () => {
                    showModal('#APNEditModal')
                    //异步加载数据
                    renderAPNEditModalContet({
                        profile_name: "",
                        apn_wan_apn: "",
                        apn_ppp_username: "",
                        apn_ppp_passwd: "",
                        apn_ppp_auth_mode: "none",
                        apn_pdp_type: "IP",
                    })
                    // 保存
                    const submitBtn = document.querySelector('#APNEditModal button[name="submit"]')
                    if (submitBtn && APNManagementFormEl) {
                        submitBtn.onclick = onSaveProfile("add")
                    }
                })
            }

            // 绑定编辑的事件
            const editAPNBtn = APNManagementForm.querySelector('#editAPNProfile')
            if (editAPNBtn) editAPNBtn.onclick = async (e) => {
                e.preventDefault()
                const title = document.querySelector('#APNEditModal #APN_MOD_TITLE')
                if (title) title.textContent = t("edit_apn")
                if (!(await initRequestData())) {
                    createToast(t("toast_need_login"), 'red');
                    return false;
                }
                closeModal('#APNManagementModal', 300, () => {
                    showModal('#APNEditModal')
                    // 获取当前选中的配置文件index
                    const profileEl = APNManagementForm.querySelector('#profileEl select[name="profile"]')
                    if (profileEl) {
                        const index = profileEl.selectedIndex
                        const config = res["APN_config" + index].split('($)')
                        const config_v6 = res["ipv6_APN_config" + index].split('($)')
                        console.log(config, config_v6);
                        renderAPNEditModalContet({
                            profile_name: config[0] || "",
                            apn_wan_apn: config[1] || "",
                            apn_ppp_username: config[5] || "",
                            apn_ppp_passwd: config[6] || "",
                            apn_ppp_auth_mode: config[4] || "",
                            apn_pdp_type: config[7] || "",
                        })
                    }
                    // 保存
                    const submitBtn = document.querySelector('#APNEditModal button[name="submit"]')
                    if (submitBtn && APNManagementFormEl) {
                        submitBtn.onclick = onSaveProfile("mod")
                    }

                })
            }

            // 绑定删除的事件
            const delAPNBtn = APNManagementForm.querySelector('#delAPNProfile')
            if (delAPNBtn) delAPNBtn.onclick = async (e) => {
                e.preventDefault()
                if (!(await initRequestData())) {
                    createToast(t("toast_need_login"), 'red');
                    return false;
                }
                // 获取当前选中的配置文件index
                const profileEl = APNManagementForm.querySelector('#profileEl select[name="profile"]')
                if (profileEl) {
                    const index = profileEl.selectedIndex
                    try {
                        const res = await deleteAPNProfile(index)
                        if (res && res.result == "success") {
                            createToast(t('toast_delete_success'), 'green')
                            // 重新加载
                            renderData()
                        } else {
                            createToast(t('toast_delete_failed'), 'red')
                        }
                    } catch (e) {
                        createToast(t('toast_delete_failed'), 'red')
                    }
                }
            }

            //绑定切换自动手动事件
            const submitBtn = APNManagementFormEl.querySelector('button[name="submit"]')
            if (submitBtn && APNManagementFormEl) {
                submitBtn.onclick = async (e) => {
                    e.preventDefault()
                    if (!(await initRequestData())) {
                        createToast(t("toast_need_login"), 'red');
                        return false;
                    }
                    const autoAPNModeEl = APNManagementForm.querySelector('#autoAPNMode')
                    const apnModeEl = APNManagementForm.querySelector('#apnMode')
                    let apn_mode = "manual"
                    let profile_name = ""
                    let index = 0
                    if (autoAPNModeEl.checked) {
                        apn_mode = "auto"
                    } else if (apnModeEl.checked) {
                        apn_mode = "manual"
                        const manualProfile = APNManagementForm.querySelector('#manualProfile')
                        if (manualProfile) {
                            profile_name = manualProfile.value
                            index = manualProfile.selectedIndex
                        }
                    }

                    if (apn_mode == "manual" && !profile_name) {
                        return createToast(t('please_select_apn_profile'), 'red')
                    }

                    try {
                        const res = await switchAPNAuto({ isAuto: apn_mode == "auto", index })
                        if (res.result == "success") {
                            createToast(t('toast_oprate_success'), 'green')
                            renderData()
                        } else {
                            createToast(t('toast_oprate_failed'), 'red')
                        }
                    } catch (e) {
                        createToast(t('toast_oprate_failed'), 'red')
                    }
                }
            }
        }
        btn.onclick = renderData
    }
    initAPNManagement()

    //查看APN
    const onViewAPNProfile = async (e) => {
        e.preventDefault()
        if (!(await initRequestData())) {
            createToast(t("toast_need_login"), 'red');
            return false;
        }
        closeModal('#APNManagementModal', 300, () => {
            showModal('#APNViewModal')
            //异步加载数据

        })
    }

    const fetchUSBStatusList = async (el) => {
        try {
            const res = await (await fetchWithTimeout(`${KANO_baseURL}/usb_status`, {
                method: "GET",
                headers: common_headers
            })).json()
            if (!res) { throw new Error('No data') }
            let isGadgetMode = res.details.typec_mode == "gadget"
            el.innerHTML = `<div style="display: flex;margin-bottom:10px;flex-direction:column"><div>${t('max_speed')}：${isGadgetMode ? res.details.gadget_speed : formatSpeed(res.maxSpeed)}</div><div>${t('usb_status')}：${res.details.typec_mode}/${!isGadgetMode ? t('host_usb_exp') : t('device_usb_exp')}</div></div>
            <ul class="deviceList" style="display: flex;flex-direction: column;gap: 10px;">
                ${res.details.devices.map(device => `<li style="padding: 10px;">
                            <div>${t('path')}：${device.path}</div>
                            <div>${t('device_name')}： ${device.product}</div>
                            <div>${t('speed')}：${formatSpeed(device.speed)}</div>
                        </li>`).join('')}
            </ul>`.trim()
        } catch {
            el.innerHTML = `<div style="text-align:center;padding:20px 0">${t('no_usb_list')}</div>`
        }
    }

    //usb管理
    let stopRefreshUSBStatusInterval = null
    const initUSBStatusManagementBtn = async () => {
        const btn = document.querySelector('#USBStatusManagement')
        if (!(await initRequestData())) {
            btn.onclick = () => createToast(t('toast_please_login'), 'red')
            return null
        }
        btn.onclick = async () => {
            showModal('#USBStatusModal')
            //加载数据
            const el = document.querySelector('#USBStatusModal .content')
            if (!el) return
            el.innerHTML = `<div style="text-align:center;padding:20px 0">Loading...</div>`
            stopRefreshUSBStatusInterval && stopRefreshUSBStatusInterval()
            fetchUSBStatusList(el)
            stopRefreshUSBStatusInterval = requestInterval(() => fetchUSBStatusList(el), REFRESH_TIME + 1000)
        }
    }
    initUSBStatusManagementBtn()

    const closeUSBStatusModal = () => {
        closeModal('#USBStatusModal', 300, () => {
            stopRefreshUSBStatusInterval && stopRefreshUSBStatusInterval()
        })
    }

    const handleOpenUploadFilesList = async () => {
        let res = await runShellWithUser(`ls /data/data/com.minikano.f50_sms/files/uploads/`)
        if (!res.success) return createToast(t('read_file_fail'), 'red')
        if (res.content && res.content.content && res.content.content.split("\n") && res.content.content.split("\n").length) {
            let { el, close } = createFixedToast('kano_edit_ufi_media_file_list_message', `
                <div style="pointer-events:all;width:90vw;max-width:800px;">
                    <div class="title" style="margin:0" data-i18n="file_manager">${t("file_manager")}</div>
                    <div style="margin:10px 0;display: flex;flex-direction: column;gap: 6px;max-height: 50vh;overflow: auto;font-size: .7rem;" class="inner">
                      ${res.content.content.split('\n').map(item => (item.trim() ? `<div class="kano_uploads_file_item" data-item="${item}" style="padding: 10px 10px;background: var(--dark-tag-color);border-radius: 6px;display:flex;align-items: center;">
                      <span onclick="copyText({target:{innerText:'/api/uploads/${item}'}})" style="flex:1;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${item}</span>
                      <button style="margin-right:6px;padding: 0;display: flex;" onclick="downloadUrl('/api/uploads/${item}','${item}')"><svg fill="var(--dark-text-color)" stroke="currentColor"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" t="1770319174878" viewBox="0 0 1024 1024" version="1.1" p-id="1583" width="20" height="20"><path d="M896 672c-17.066667 0-32 14.933333-32 32v128c0 6.4-4.266667 10.666667-10.666667 10.666667H170.666667c-6.4 0-10.666667-4.266667-10.666667-10.666667v-128c0-17.066667-14.933333-32-32-32s-32 14.933333-32 32v128c0 40.533333 34.133333 74.666667 74.666667 74.666667h682.666666c40.533333 0 74.666667-34.133333 74.666667-74.666667v-128c0-17.066667-14.933333-32-32-32z" fill="var(--dark-text-color)" p-id="1584"/><path d="M488.533333 727.466667c6.4 6.4 14.933333 8.533333 23.466667 8.533333s17.066667-2.133333 23.466667-8.533333l213.333333-213.333334c12.8-12.8 12.8-32 0-44.8-12.8-12.8-32-12.8-44.8 0l-157.866667 157.866667V170.666667c0-17.066667-14.933333-32-32-32s-34.133333 14.933333-34.133333 32v456.533333L322.133333 469.333333c-12.8-12.8-32-12.8-44.8 0-12.8 12.8-12.8 32 0 44.8l211.2 213.333334z" fill="var(--dark-text-color)" p-id="1585"/></svg></button>
                      <button style="margin-right:6px;padding: 0;display: flex;" onclick="openLink('/api/uploads/${item}')"><svg fill="var(--dark-text-color)" stroke="currentColor"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" t="1770319810359" viewBox="0 0 1024 1024" version="1.1" p-id="3490" width="20" height="20"><path d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3-7.7 16.2-7.7 35.2 0 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766z" p-id="3491" fill="var(--dark-text-color)"/><path d="M508 336c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176z m0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z" p-id="3492" fill="var(--dark-text-color)"/></svg></button>
                      <button class="delete_file" style="padding: 0;display: flex;"><svg fill="var(--dark-text-color)" stroke="currentColor"  width="20px" height="20px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="var(--dark-text-color)" d="M736 352.032L736.096 800h-0.128L288 799.968 288.032 352 736 352.032zM384 224h256v64h-256V224z m448 64h-128V202.624C704 182.048 687.232 160 640.16 160h-256.32C336.768 160 320 182.048 320 202.624V288H192a32 32 0 1 0 0 64h32V799.968C224 835.296 252.704 864 288.032 864h447.936A64.064 64.064 0 0 0 800 799.968V352h32a32 32 0 1 0 0-64z"></path><path fill="var(--dark-text-color)" d="M608 690.56a32 32 0 0 0 32-32V448a32 32 0 1 0-64 0v210.56a32 32 0 0 0 32 32M416 690.56a32 32 0 0 0 32-32V448a32 32 0 1 0-64 0v210.56a32 32 0 0 0 32 32"></path></svg></button></div>` : "")).join('')}
                    </div>
                    <div style="text-align:right">
                        <button style="font-size:.64rem" id="upload_media_file_btn" data-i18n="upload_file_limit_100mb">${t('upload_file_limit_100mb')}</button>
                        <button style="font-size:.64rem" id="close_edit_media_file_list_message_btn" data-i18n="close_btn">${t('close_btn')}</button>
                    </div>
                </div>
                `)

            //文件列表
            let filesEl = document.querySelectorAll('#kano_edit_ufi_media_file_list_message .kano_uploads_file_item')
            filesEl.forEach(el => {
                let data = el.dataset.item
                if (data && data.trim()) {
                    let elBtn = el.querySelector('.delete_file')
                    if (!elBtn) return
                    let delCountDown = 3
                    let delTimer = null
                    elBtn.onclick = async () => {
                        let delFile = data.trim()
                        delCountDown--
                        delTimer && clearTimeout(delTimer)
                        delTimer = setTimeout(() => {
                            delCountDown = 3
                        }, 3000);
                        if (delCountDown > 0) {
                            createToast(t('click_times_to_delete').replaceAll("$count$", ` ${delCountDown} `))
                            return
                        }
                        delCountDown = 3
                        try {
                            const { result, error } = await (await fetchWithTimeout(`${KANO_baseURL}/delete_img`, {
                                method: "POST",
                                headers: common_headers,
                                body: JSON.stringify({
                                    file_name: delFile
                                })
                            })).json()
                            if (result == "success") {
                                createToast(t('toast_delete_success'), "pink")
                                el.remove()
                            } else {
                                createToast(t('toast_delete_failed') + error, "red")
                            }
                        } catch (e) {
                            createToast(t('toast_delete_failed') + e, "red")
                        }
                    }
                }
            })
            let btn = el.querySelector('#close_edit_media_file_list_message_btn')
            let uploadBtn = el.querySelector('#upload_media_file_btn')

            if (!btn) {
                close()
                return
            }
            btn.onclick = async () => {
                close()
            }

            if (uploadBtn) {
                uploadBtn.onclick = () => {
                    let fileInput = document.createElement('input')
                    fileInput.type = "file"
                    const handleFileChange = async (event) => {
                        let file = event.target.files[0];
                        if (!file) return
                        let url = await uploadFileKano(file, true)
                        if (!url) return
                        createToast(`${url} ${t('toast_upload_success')}!`, "pink", 8000)
                        close()
                        setTimeout(() => {
                            handleOpenUploadFilesList()
                        }, 400);
                        fileInput.removeEventListener('change', handleFileChange);
                        fileInput = null;
                    }
                    fileInput.addEventListener('change', handleFileChange)
                    fileInput.click()
                }
            }


        } else {
            createToast(t('no_file'), 'pink')
        }
    }

    const showNetConnInfoModal = async () => {
        if (!(await initRequestData())) {
            createToast(t('toast_please_login'), 'red')
            return null
        }
        const id = "#kano_net_info_modal"
        const res = await getNetConnInfo()
        let intervalFn = requestInterval(() => {
            getNetConnInfo().then(res => {
                const contentEl = document.querySelector('#kano_net_info_modal .content')
                if (contentEl) {
                    contentEl.innerHTML = renderConnectStatusContent(res)
                }
            })
        }, REFRESH_TIME + 114, id)
        const md = createModal({
            showConfirm: false,
            name: id.replace('#', ''),
            isMask: false,
            titleI18nKey: 'network_conn_info',
            title: t('network_conn_info'),
            maxWidth: "400px",
            contentStyle: "font-size:.7rem;line-height:1.5",
            onClose: () => {
                intervalFn && intervalFn()
                return true
            },
            content: renderConnectStatusContent(res)
        })
        md.id && showModal(md.id)
    }

    //免密码登录
    const noPassLogin = () => {
        const method = "0"
        const password = "Wa@9w+YWRtaW4="

        //下面不用改
        const loginMethodEl = document.querySelector("#login_method")
        const label = document.querySelector("#token_div_label2")
        const tokenEl = document.querySelector("#PWD_BLK")
        const pwdEl = document.querySelector("#PWDINPUT")
        loginMethodEl.value = method
        pwdEl.value = password
        label.style.display = "none"
        tokenEl.style.display = "none"
        createToast(t('toast_no_pass_login_fill_success'), 'green')
    }

    //切换密码显示
    const switchPassInputShow = (e, id) => {
        e.preventDefault()
        const target = e.currentTarget
        if (target != e.target) return
        if (!id) return
        const pwdEl = document.querySelector(id)
        if (!pwdEl) return
        if (pwdEl.type == "password") {
            pwdEl.type = "text"
            target.innerHTML = `<svg style="pointer-events: none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a21.77 21.77 0 0 1-4.35 5.35"/><path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"/><path d="M1 1l22 22"/></svg>`
        } else {
            pwdEl.type = "password"
            target.innerHTML = `<svg style="pointer-events: none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>`
        }
    }

    const resetUsageModalData = () => {
        const tbody = document.querySelector('#DataUsageHistoryBody')
        if (!tbody) return
        const sumEl = document.querySelector("#data_usage_history_sum")
        const avgEl = document.querySelector("#data_usage_history_avg")
        if (!sumEl) return
        if (!avgEl) return
        sumEl.textContent = "N/A"
        avgEl.textContent = "N/A"
        tbody.innerHTML = '<tr style="cursor: pointer;"><td colspan="2" data-i18n="no_data">' + t('no_data') + '</td></tr>'
        //默认日期间隔10天
        const startTimeEl = document.querySelector('#start_time_data_usage_history')
        const endTimeEl = document.querySelector('#end_time_data_usage_history')
        const today = new Date()
        const start = new Date(today);
        start.setDate(start.getDate() - 10);
        if (startTimeEl) {
            startTimeEl.value = formatLocalDate(start)
        }
        if (endTimeEl) {
            endTimeEl.value = formatLocalDate(today)
        }
        updateDataHistoryChart({
            items: []
        })
    }
    const openDataUsageHistory = async () => {
        if (!(await initRequestData())) {
            createToast(t('toast_please_login'), 'red')
            return null
        }
        resetUsageModalData()
        doDataUsageHistorySearch()
        showModal('#DataUsageHistoryModal')
    }

    const doDataUsageHistorySearch = async () => {
        const startTimeEl = document.querySelector('#start_time_data_usage_history')
        const endTimeEl = document.querySelector('#end_time_data_usage_history')
        if (!startTimeEl || !endTimeEl) return
        const startTime = startTimeEl.value
        const endTime = endTimeEl.value

        const tbody = document.querySelector('#DataUsageHistoryBody')
        if (!tbody) return
        const sumEl = document.querySelector("#data_usage_history_sum")
        const avgEl = document.querySelector("#data_usage_history_avg")
        if (!sumEl) return
        if (!avgEl) return
        sumEl.textContent = "N/A"
        avgEl.textContent = "N/A"
        tbody.innerHTML = '<tr style="cursor: pointer;"><td colspan="2" data-i18n="no_data">' + t('no_data') + '</td></tr>'

        if (!startTime || !endTime) {
            if (!startTime) createToast(t('please_input_start_date'), 'pink')
            if (!endTime) createToast(t('please_input_end_date'), 'pink')
            return
        }

        const end = new Date(endTime);
        const start = new Date(startTime);
        const today = new Date();

        end.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (end > today) {
            return createToast(t('please_input_correct_date'), 'pink')
        }
        if (start > end) {
            return createToast(t('start_date_not_bigger_than_end_date'), 'pink')
        }
        const diffDays = Math.floor((end - start) / (24 * 60 * 60 * 1000));
        if (diffDays > 400) {
            return createToast(t('date_range_over_400'), 'pink');
        }
        tbody.innerHTML = '<tr style="cursor: pointer;"><td colspan="2"><strong class="green" style="display: flex;flex-direction: column;"><span style="font-size: 2rem;" class="spin">🌀</span><span style="font-size: .8rem;padding-top: 10px;">loading...</span></strong></td></tr>'
        const res = await getDailyUsageRange(new Date(startTime), new Date(endTime))
        tbody.innerHTML = ''
        if (res.length == 0) {
            tbody.innerHTML = '<tr style="cursor: pointer;"><td colspan="2" data-i18n="no_data">' + t('no_data') + '</td></tr>'
            return
        }
        let sumBytes = 0
        res.forEach(item => {
            let tr = document.createElement('tr')
            let dateTd = document.createElement('td')
            let timeTd = document.createElement('td')
            dateTd.textContent = item.date
            timeTd.textContent = item.usage == 0 ? "0 B" : formatBytes(item.usage)
            tr.appendChild(dateTd)
            tr.appendChild(timeTd)
            tbody.appendChild(tr)
            sumBytes += parseInt(item.usage)
        })

        let avgBytes = sumBytes / res.length

        sumEl.textContent = sumBytes == 0 ? '0 B' : formatBytes(sumBytes)
        avgEl.textContent = avgBytes == 0 ? '0 B' : formatBytes(avgBytes)

        //更新图表
        updateDataHistoryChart({
            items: res, sum: sumBytes, avg: avgBytes
        })
    }

    const pluginSubmitBtn = document.querySelector('#pluginSubmitBtn')
    if (pluginSubmitBtn) {
        pluginSubmitBtn.onclick = () => {
            createToast(t('plugin_post_request_toast'), '', 8000)
            const to = "plugin@kano.ink";
            const subject = t('plugin_post_request');
            window.location.href =
                `mailto:${to}?subject=${encodeURIComponent(subject)}`;
        }
    }

    const handleVoLTE = async () => {
        try {
            const voLTESwitchBtn = document.querySelector('#VoLTESwitchBtn')
            if (!voLTESwitchBtn) return

            const res = await (await fetchWithTimeout(`${KANO_baseURL}/volte_status`, {
                method: "POST",
                body: JSON.stringify({ enabled: voLTESwitchBtn.dataset.enabled == "1" ? "0" : "1", slot: 0 }),
                headers: common_headers
            })).json()
            if (res.result == "success") {
                createToast(t('toast_oprate_success'), 'green')
                initVoLTESwitchBtn()
            } else {
                createToast(t('toast_oprate_failed'), 'red')
            }
        } catch (e) {
            createToast(t('toast_oprate_failed') + e, 'red')
        }
    }

    const handleVoLTE1 = async () => {
        try {
            const voLTESwitchBtn1 = document.querySelector('#VoLTESwitchBtn1')
            if (!voLTESwitchBtn1) return

            const res = await (await fetchWithTimeout(`${KANO_baseURL}/volte_status`, {
                method: "POST",
                body: JSON.stringify({ enabled: voLTESwitchBtn1.dataset.enabled == "1" ? "0" : "1", slot: 1 }),
                headers: common_headers
            })).json()
            if (res.result == "success") {
                createToast(t('toast_oprate_success'), 'green')
                initVoLTESwitchBtn()
            } else {
                createToast(t('toast_oprate_failed'), 'red')
            }
        } catch (e) {
            createToast(t('toast_oprate_failed') + e, 'red')
        }
    }

    const handleVoNR = async () => {
        try {
            const voNRSwitchBtn = document.querySelector('#VoNRSwitchBtn')
            if (!voNRSwitchBtn) return

            const res = await (await fetchWithTimeout(`${KANO_baseURL}/vonr_status`, {
                method: "POST",
                body: JSON.stringify({ enabled: voNRSwitchBtn.dataset.enabled == "1" ? "0" : "1", slot: 0 }),
                headers: common_headers
            })).json()
            if (res.result == "success") {
                createToast(t('toast_oprate_success'), 'green')
                initVoNRSwitchBtn()
            } else {
                createToast(t('toast_oprate_failed'), 'red')
            }
        } catch (e) {
            createToast(t('toast_oprate_failed') + e, 'red')
        }
    }

    const handleVoNR1 = async () => {
        try {
            const voNRSwitchBtn1 = document.querySelector('#VoNRSwitchBtn1')
            if (!voNRSwitchBtn1) return

            const res = await (await fetchWithTimeout(`${KANO_baseURL}/vonr_status`, {
                method: "POST",
                body: JSON.stringify({ enabled: voNRSwitchBtn1.dataset.enabled == "1" ? "0" : "1", slot: 1 }),
                headers: common_headers
            })).json()
            if (res.result == "success") {
                createToast(t('toast_oprate_success'), 'green')
                initVoNRSwitchBtn()
            } else {
                createToast(t('toast_oprate_failed'), 'red')
            }
        } catch (e) {
            createToast(t('toast_oprate_failed') + e, 'red')
        }
    }

    //切换流量管理
    const switchDataMgrMethod = (method) => {
        const dataManagementForm = document.querySelector('#DataManagementForm')
        const uFIDataManagementForm = document.querySelector('#UFIDataManagementForm')
        switch (method.toLowerCase()) {
            case 'official':
                dataManagementForm.style.display = 'block'
                uFIDataManagementForm.style.display = 'none'
                break
            case 'ufi':
                dataManagementForm.style.display = 'none'
                uFIDataManagementForm.style.display = 'block'
                break
                break
        }
        return method.toLowerCase()
    }

    //切换流量管理tab
    const switchDataMgrMethodTab = (e) => {
        const target = e.target
        if (target.tagName != 'BUTTON') return
        const children = target.parentNode?.children
        if (!children) return
        Array.from(children).forEach((item) => {
            if (item != target) {
                item.classList.remove('active')
            }
        })
        target.classList.add('active')
        const method = target.dataset.method
        switchDataMgrMethod(method)
    }



    //UFI流量管理逻辑
    const initUfiDataManagementModal = async () => {
        if (!(await initRequestData())) {
            createToast(t('toast_please_login'), 'red')
            out()
            return null
        }

        const res = await (await fetchWithTimeout(`${KANO_baseURL}/get_data_limit`)).json()
        if (!res) {
            createToast(t('toast_get_data_usage_failed'), 'red')
            return null
        }

        const form = document.querySelector('#UFIDataManagementForm')
        if (!form) return null

        const data_flow_limit_enabled = form.querySelector('input[name="data_flow_limit_enabled"]')
        const data_flow_max_limit = form.querySelector('input[name="data_flow_max_limit"]')
        const data_limit_status_forward_enabled = form.querySelector('input[name="data_limit_status_forward_enabled"]')

        const data_flow_max_limit_type = form.querySelector('select[name="data_flow_max_limit_type"]')

        if (data_limit_status_forward_enabled) data_limit_status_forward_enabled.checked = res.data_limit_status_forward_enabled == "1"

        const bytes = Number(res.data_flow_max_limit || 0)

        if (bytes <= 0) {
            data_flow_max_limit.value = "0"
            data_flow_max_limit_type.value = "1024"
        } else if (bytes % (1024 ** 4) === 0) {
            data_flow_max_limit.value = String(bytes / (1024 ** 4))
            data_flow_max_limit_type.value = "1048576"
        } else if (bytes % (1024 ** 3) === 0) {
            data_flow_max_limit.value = String(bytes / (1024 ** 3))
            data_flow_max_limit_type.value = "1024"
        } else {
            data_flow_max_limit.value = String(Math.floor(bytes / (1024 ** 2)))
            data_flow_max_limit_type.value = "1"
        }


        data_flow_limit_enabled.checked =
            res.data_flow_limit_enabled === true ||
            res.data_flow_limit_enabled === "1" ||
            res.data_flow_limit_enabled === 1

        const flowType = res.data_flow_check_daily_or_monthly || "monthly"
        const flowTypeRadio = form.querySelector(
            `input[name="data_flow_check_daily_or_monthly"][value="${flowType}"]`
        )
        if (flowTypeRadio) flowTypeRadio.checked = true

        const reference = res.data_check_reference == "android" ? "ufi" : "official" || "official"
        const referenceRadio = form.querySelector(
            `input[name="data_check_reference"][value="${reference}"]`
        )
        if (referenceRadio) referenceRadio.checked = true
    }

    //UFI流量管理表单提交
    let handleUFIDataManagementFormSubmit = async (e) => {
        e.preventDefault();
        try {
            let form_data = {
                "data_flow_limit_enabled": "0",
                "data_flow_max_limit": -1,
                "data_flow_check_daily_or_monthly": "monthly",
                "data_check_reference": "default",
                "data_limit_status_forward_enabled": "0"
            }

            const form = e.target; // 获取表单
            const formData = new FormData(form);

            const data_flow_max_limit_type = formData.get("data_flow_max_limit_type")

            for (const [key, value] of formData.entries()) {
                switch (key) {
                    case 'data_flow_limit_enabled':
                        form_data[key] = value.trim() == 'on' ? '1' : '0'
                        break;
                    case 'data_check_reference':
                        form_data[key] = value.trim() == 'official' ? 'default' : 'android'
                        break;
                    case 'data_flow_check_daily_or_monthly':
                        form_data[key] = value.trim() == 'monthly' ? 'monthly' : 'daily'
                        break;
                    case 'data_limit_status_forward_enabled':
                        form_data[key] = value.trim() == 'on' ? '1' : '0'
                        break;
                    case 'data_flow_max_limit':
                        if (isNaN(Number(value.trim()))) {
                            createToast(t('data_flow_max_limit_must_be_number'), 'red')
                            return
                        }
                        if (Number(value.trim()) <= 0) {
                            createToast(t('data_flow_max_limit_must_greater_than_0'), 'red')
                            return
                        }
                        form_data[key] = (Number(value.trim()) * Number(data_flow_max_limit_type) * Math.pow(1024, 2)).toFixed(3)
                        break;
                }
            }

            try {
                const res = await (await fetchWithTimeout(`${KANO_baseURL}/set_data_limit`, {
                    method: "POST",
                    body: JSON.stringify(form_data),
                    headers: common_headers
                })).json()

                if (res.result == 'success') {
                    createToast(t('toast_set_success'), 'green')
                    closeModal('#DataManagementModal')
                } else {
                    throw t('toast_set_failed')
                }
            } catch (e) {
                createToast(e.message, 'red')
            }
        } catch (e) {
            createToast(e.message, 'red')
        }
    };

    //官方后台貌似对PIN超出次数的判定有问题，PIN次数用完后提示输入PUK，此时换卡也不会变更状态，用户只能恢复出厂设置，所以此功能不会继续实现
    // let simCardPinDisabled = false
    // const initSimCardPin = async () => {
    //     if (!initRequestData()) {
    //         return null
    //     }
    //     //检测是否有SIM卡锁定
    //     const res = await getSimPinStatus()

    //     if (res.pinnumber <= 0 || res.modem_main_state == "modem_waitpuk") {
    //         createToast("您的PIN次数已用尽，请前往官方后台输入PUK码解锁", 'red', 10000)
    //         return null
    //     }

    //     if (!(res.modem_main_state == "modem_waitpin")) {
    //         return null
    //     }

    //     //暂停数据刷新
    //     stopRefresh()

    //     const md = createModal({
    //         name: "kano_pin_modal",
    //         isMask: true,
    //         title: "请输入SIM卡PIN码",
    //         maxWidth: "400px",
    //         contentStyle: "font-size:12px",
    //         onClose: () => {
    //             return true
    //         },
    //         onConfirm: async () => {
    //             //再次获取数据
    //             const res1 = await getSimPinStatus()
    //             if (res1.pinnumber <= 0) {
    //                 createToast("您的PIN次数已用尽，请前往官方后台输入PUK码解锁", 'red')
    //                 return false
    //             }
    //             const el = document.querySelector('#simPinInput')
    //             if (!el) {
    //                 console.error("没有找到#simPinInput元素")
    //                 return false
    //             }
    //             const pinNumber = el.value.trim()
    //             if (pinNumber.length < 4) {
    //                 createToast("PIN不得小于4位数", 'pink')
    //                 return false
    //             }
    //             //解锁
    //             if (simCardPinDisabled) {
    //                 createToast("正在解锁中，请勿重复点击", 'pink')
    //                 return false
    //             }

    //             simCardPinDisabled = true

    //             const { close: closeLoadingEl } = createFixedToast("unlocking_toast", '解锁中...')
    //             try {
    //                 if (!(await initRequestData())) {
    //                     return false
    //                 }
    //                 const cookie = await login()
    //                 if (!cookie) {
    //                     createToast(t('toast_request_error'), 'red')
    //                     return false
    //                 }
    //                 let res1 = await (await postData(cookie, {
    //                     goformId: 'ENTER_PIN',
    //                     PinNumber: pinNumber,
    //                 })).json()

    //                 if (res1.result == 'success') {
    //                     createToast("PIN解锁成功", 'green')
    //                     startRefresh()
    //                     return true
    //                 } else {
    //                     createToast("PIN解锁失败，请重试", 'red')
    //                 }
    //                 //更新Pin次数
    //                 const pinNumEl = document.querySelector('#pinNumber')
    //                 const res_refresh = await getSimPinStatus()
    //                 if (pinNumEl) {
    //                     pinNumEl.textContent = res_refresh.pinnumber
    //                 }
    //                 return false
    //             } catch (e) {
    //                 console.error(e.message)
    //                 return false
    //             } finally {
    //                 simCardPinDisabled = false
    //                 closeLoadingEl()
    //             }
    //         },
    //         content: `<div class="content" style="font-size:12px;margin:10px 0;padding:0 4px;">
    //    <p style="color:red;margin-top:0" >PIN 剩余次数：<strong id="pinNumber">${res.pinnumber}</strong></p>
    //    <input type="password" id="simPinInput" placeholder="SIM卡PIN码" style="width:100%;padding:8px">
    // </div>`
    //     })
    //     showModal(md.id)
    // }
    // initSimCardPin()
    //挂载方法到window
    const methods = {
        exportPlugin,
        handleUFIDataManagementFormSubmit,
        switchDataMgrMethodTab,
        handleVoLTE,
        handleVoNR,
        handleVoLTE1,
        handleVoNR1,
        saveCustomRepo,
        resetCustomRepo,
        resetUsageModalData,
        openDataUsageHistory,
        doDataUsageHistorySearch,
        editHostName,
        switchPassInputShow,
        noPassLogin,
        showNetConnInfoModal,
        handleOpenUploadFilesList,
        clearAPPUploadData,
        closeUSBStatusModal,
        onCloseChangeTokenForm,
        handleChangeToken,
        toggleLogCat,
        toggleWakeLock,
        changeResServer,
        onChangeIsAutoFrofile,
        onViewAPNProfile,
        changeSleepTime,
        handleHighRailMode,
        openNicknameSetting,
        nicknameSettingClick,
        setPort,
        resetTTYDPort,
        initTTYD,
        togglePort,
        toggleTTYD,
        toggleADBIP,
        unlockAllBand,
        handleForceIMEI,
        handlePluginStoreSearchInput,
        installPluginFromStore,
        saveCellularTestUrl,
        onThreadNumChange,
        closeCellularTest,
        handleCellularLoopMode,
        startCellularTestRealtime,
        runSingleTest,
        getBoot,
        handleDisableFOTA,
        refreshTask,
        savePluginSetting,
        fillAction,
        closeAddTask,
        addTask,
        editTask,
        handleSubmitTask,
        clearPluginText,
        pluginExport,
        closeAdvanceToolsModal,
        syncTheme,
        switchCpuCore,
        changeRefreshRate,
        onPluginBtn,
        handlePluginFileUpload,
        OP,
        onLANModalSubmit,
        switchSmsForwardMethodTab,
        handleSmsForwardCurlForm,
        handleSmsForwardForm,
        handleSmsForwardDingTalkForm,
        handleShell,
        enableTTYD,
        changeNetwork,
        changeUSBNetwork,
        changeSimCard,
        changeWIFISwitch,
        unlockAllCell,
        onTokenConfirm,
        sendSMS,
        deleteSMS,
        deleteAndReSendSms,
        resetShowList,
        handleDataManagementFormSubmit,
        handleWIFIManagementFormSubmit,
        handleScheduleRebootFormSubmit,
        handleWifiEncodeChange,
        handleFileUpload,
        handleATFormSubmit,
        handleChangePassword,
        handleShowPassword,
        submitBandForm,
        submitCellForm,
        initClientManagementModal,
        closeClientManager,
        resetTheme,
        handleSubmitBg,
        disableButtonWhenExecuteFunc,
        onCloseChangePassForm,
        startTest,
        handleLoopMode,
        onClosePayModal,
        handleTTYDFormSubmit,
        handleQosAT,
        handleSambaPath,
        handleAT,
        setOrRemoveDeviceFromBlackList,
        onSelectCellRow,
        handleClosePayModal,
        toggleCellInfoRefresh
    }

    try {
        Object.keys(methods).forEach((method) => {
            window[method] = methods[method]
        })
        Object.keys(methods).forEach((method) => {
            globalThis[method] = methods[method]
        })
    }
    catch { }

    // 初始化语言包
    (() => {
        const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
        const langToLoad = savedLang || detectBrowserLang();
        loadLanguage(langToLoad);
    })()
}
