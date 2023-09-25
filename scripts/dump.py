#!/usr/bin/env python3
import json
import requests


def dump(url: str, args: dict[str, str]):
    last_cursor = None
    cursor = 0
    data = []
    while last_cursor != cursor:
        if cursor:
            args['cursor'] = cursor
        res = requests.get(url, params=args)
        j = res.json()
        if j['numFound'] == 0:
            print('No documents found')
            break
        print(j['numFound'], j['cursor'])
        last_cursor = cursor
        cursor = j['cursor']
        data += j['documents']
    
    return data


def dump_vorgang():
    url = 'https://search.dip.bundestag.de/api/v1/vorgang'
    args = {'f.wahlperiode': '20', 'format': 'json', 'apikey': 'rgsaY4U.oZRQKUHdJhF9qguHMkwCGIoLaqEcaHjYLF'}
    vorgang = dump(url, args)
    json.dump(vorgang, open('vorgang.json', 'wt'), indent=4)


def dump_vorgangsposition():
    url = 'https://search.dip.bundestag.de/api/v1/vorgangsposition'
    args = {'f.wahlperiode': '20', 'format': 'json', 'apikey': 'rgsaY4U.oZRQKUHdJhF9qguHMkwCGIoLaqEcaHjYLF'}
    vorgang = dump(url, args)
    json.dump(vorgang, open('vorgangsposition.json', 'wt'), indent=4)


if __name__ == '__main__':
    dump_vorgang()
    dump_vorgangsposition()
