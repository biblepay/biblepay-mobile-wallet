import { StyleSheet } from 'react-native'

import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(8),
    backgroundColor: '#06062a',
    marginHorizontal: wp(2.5),
    borderRadius: 5,
    marginBottom: hp(0.5),
    paddingHorizontal: wp(4)
  },
  containerLight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(8),
    backgroundColor: 'white',
    marginHorizontal: wp(2.5),
    borderRadius: 5,
    marginBottom: hp(0.5),
    paddingHorizontal: wp(4)
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  addressText: {
    fontFamily: 'MADETOMMY',
    color: 'white',
    fontSize: wp(3.2),
  },
  addressTextLight: {
    fontFamily: 'MADETOMMY',
    color: 'black',
    fontSize: wp(3.2),
  },
  labelText: {
    fontFamily: 'MADETOMMY',
    color: 'white',
    fontSize: wp(3),
    paddingRight: wp(2)
  },
  labelTextLight: {
    fontFamily: 'MADETOMMY',
    color: '#7F7F7F',
    fontSize: wp(3),
    paddingRight: wp(2)
  },
  dateText: {
    fontFamily: 'MADETOMMY',
    color: '#004FFF',
    fontSize: wp(3),
    paddingRight: wp(2)
  },
  dateTextLight: {
    fontFamily: 'MADETOMMY',
    color: '#004FFF',
    fontSize: wp(3),
    paddingRight: wp(2)
  },
  icon: {
    marginRight: wp(4)
  },
  amountText: {
    fontFamily: 'MADETOMMY',
    fontSize: wp(3),
  },
  posAmountText: {
    color: '#466FB8'
  },
  negAmountText: {
    color: '#bc8f3a'
  },
  tickerText: {
    fontFamily: 'MADETOMMY',
    color: '#9D9FBE',
  }
})
