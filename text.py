import base64
import json
import urllib.parse

import requests


def send_request_POST() -> requests.Response:
    headers =  [
        ["cache-control", "no-cache"],
        ["sec-ch-ua-platform", "\"Windows\""],
        ["user-agent", 'dasdasdasdsad'],
        ["accept", "application/json"],
        ["sec-ch-ua", "\"Google Chrome\";v=\"126\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"126\""],
        ["content-type", "text/plain"],
        ["sec-ch-ua-mobile", "?0"],
        ["origin", "https://newassets.hcaptcha.com"],
        ["sec-fetch-site", "same-site"],
        ["sec-fetch-mode", "cors"],
        ["sec-fetch-dest", "empty"],
        ["sec-fetch-storage-access", "active"],
        ["referer", "https://newassets.hcaptcha.com/"],
        ["accept-encoding", "gzip, deflate, br, zstd"],
        ["accept-language", "zh,zh-CN;q=0.9,en;q=0.8"],
        ["priority", "u=1, i"]

    ]


    data ={
        'collect': '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',
        'tlg': '2432',
        'eks': 'jgRV5cVKt55oob94kMr5XPqR/Rg5jOLNtOeEE2A6xdAacoMwwRnEwyJyXTDiQz91OUoFpM8ih0FsWS5Nd3ondsQgFxGPJFXtVa3BpcFRI/aesijZKsOWJ75/6sweySWqL5Yg/BUtDQ1ESueHCga2KpSyojT4J08tH/YN9pTrtavDH/TX2WoJK/bh/5mzKenn23dTDCnSbMcuvQjVCN6H9erDHd/sF+FPTbcjLg/tkY4=',
        'sess': 's0vP93cOMLB99IuLJ0Iro1miP8F5IOcVwgAf-IRRrSnEW_-F3BrSfUzKxx5ECb5wp0_Mn_wPKbVivaubtZe8WzJeEU_OCJQufuBURHxZ-EZIfNvL7Izln6ns05qtsCiYxBCtmewxhw-gH-HqBvjeDQOiyKb8ktLUgroTPXTdrNaWAkYR8i--eYy0VMWKAj_CSETd096s2exnZzw8JS2YBZh8DMsW2rvcSwAVChai_Cm7A99rJqxTCzrfyM1971A3phyf83d8xSzhjrzC55PAWmClhukFc-XXNfILTswSgZLkBFH3TWgzfWc5Ec-Z47Ec3xW46PK7psUQ5--htlb9m69EmGPybSXSesmbwjE_mhyDXnepCSUN52O36czOtvlDRnTiB4wwR15ITSQ4Owf6xROeyNBVLoVL0F9-YwS58x0mmkIgeZ9ZSZ8ITtIaXO-WABy_TzjQJsBvYV-FGkImQBGcKmc2NZ2GQqt53eRP1e3-c0YG9KkMiNhpFP2diUjVUepKhIpsYXLI_MIPbJmPwY2tJT7fkFwt1-M11biQhpMDjLOYqulD6-uflxyKL_ydbXK38RoMvWYN546HhZ4lAPhrs3dmb6uKRwkT6JjskEFRvNEH1O5hImCaHj_NMBLcmi5UUJZbXBhsq5YK7MnM3fUfMycSTTRxzSY_P1LMqB-yRcGJUaDC57PyGvMdaKoiRkQEhGg3w2teeP5aiFG0XRNEuNHtLLim-6dCDkZ1HJAFMbT6fRlrmlQPcvSjIVRAmR5a-AKYZyaiGFiGLDDlfpcPax0gaaJJCk_9OFq24HEKnxkklyf4K9t3CmcPBU2Ve4',
        'ans': '[{"elem_id":1,"type":"DynAnswerType_UC","data":"5,6"}]',
        'pow_answer': 'cafdee0e1e3b5ac0#10298',
        'pow_calc_time': '27',
    }
    data = json.dumps(data)


    return requests.post('http://127.0.0.1:15090/proxy',
                         json={'url': 'https://t.captcha.qq.com/cap_union_new_verify',
                               "headers": headers,
                               'method': 'POST',
                               'bodyType': '', # 传2进制数据可以直接 'bodyType': 'b64' 下面的body是2进制的base64编码, 
                                 'client_id': 'be22165f-e3c3-4570-94f1-017ea57ae459',
                            "token": "d7bed4fd-9852-430f-9d2a-695d2641bf80",
                               "body": data,
                               'proxy': 'http://xxx.xxx.xxx.xxx:xxxx'
                               })


def send_request_GET() -> requests.Response:
    headers = [
        ["cache-control", "no-cache"],
        ["sec-ch-ua-platform", "\"Windows\""],
        ["user-agent", 'ddddd'],
        ["accept", "application/json"],
        ["sec-ch-ua", "\"Google Chrome\";v=\"126\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"126\""],
        ["content-type", "text/plain"],
        ["sec-ch-ua-mobile", "?0"],
        ["origin", "https://newassets.hcaptcha.com"],
        ["sec-fetch-site", "same-site"],
        ["sec-fetch-mode", "cors"],
        ["sec-fetch-dest", "empty"],
        ["sec-fetch-storage-access", "active"],
        ["referer", "https://newassets.hcaptcha.com/"],
        ["accept-encoding", "gzip, deflate, br, zstd"],
        ["accept-language", "zh,zh-CN;q=0.9,en;q=0.8"],
        ["priority", "u=1, i"]

    ]

    return requests.post('http://127.0.0.1:15090/proxy', json={'url': 'https://www.baidu.com',
                                                                    "headers": headers,
                                                                    'method': 'GET',
                                                                    'bodyType': '',
                                                                     'client_id': 'be22165f-e3c3-4570-94f1-017ea57ae459',
                                                                    'proxy': 'http://xxx.xxx.xxx.xxx:xxxx',
                                                                             "token": "d7bed4fd-9852-430f-9d2a-695d2641bf80",
                                                                    })





def main():
    try:
        response = send_request_POST()
        print(f"Status Code: {response.status_code}")
        print(f"Response: {base64.b64decode( response.json()['data']).decode('utf-8')}")
        print(f"Response: {response.headers}")
        response = send_request_GET()
        print(f"Status Code: {response.status_code}")
        print(f"Response: {base64.b64decode( response.json()['data']).decode('utf-8')}")
        print(f"Response: {response.headers}")
    except Exception as e:
        print(f"发生错误: {e}")


if __name__ == "__main__":
    main()
