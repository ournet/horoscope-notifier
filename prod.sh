#!/bin/bash

yarn unlink @ournet/domain
yarn unlink @ournet/api-client
yarn unlink @ournet/horoscopes-domain
yarn unlink ournet.links

yarn add @ournet/domain
yarn add @ournet/api-client
yarn add @ournet/horoscopes-domain
yarn add ournet.links

yarn test
