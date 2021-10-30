import React, {Component} from 'react';

import {
    SafeAreaView,
    Text,
    FlatList,
    View,
    TextInput,
    ActivityIndicator,
    StatusBar,
    Image,
    TouchableOpacity,
    Platform, BackHandler,
} from 'react-native';

import {connect} from 'react-redux';

// Styles
import styles from './Styles/SendScreenStyle';

import AccountActions, {AccountSelectors} from '../Redux/AccountRedux';

import parseParams from '../Helpers/ParseParamsFromQueryString';
import {Navigation} from 'react-native-navigation';

import Button from '../Components/Button';
import Header from '../Components/TitleHeader';

import ScanQr from '../Images/scan-qrcode-dark.svg';
import ScanQrLight from '../Images/scan-qrcode-light.svg';
import SendMoney from '../Images/send-money.svg';
import SendMoneyLight from '../Images/send-money-light.svg';

import MaxAmount from '../Images/maxamount-dark.svg';
import MaxAmountLight from '../Images/maxamount-light.svg';

import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

import normalRepresentation from '../Helpers/normalRepresentation';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import {GlobalSelectors} from '../Redux/GlobalRedux';
import { NetworkSelectors } from '../Redux/NetworkRedux'

import AppConfig from '../Config/AppConfig'
import I18n from '../I18n'

const weekday = new Array(7);
weekday[0] = I18n.t('sunday');
weekday[1] = I18n.t('monday');
weekday[2] = I18n.t('tuesday');
weekday[3] = I18n.t('wednesday');
weekday[4] = I18n.t('thursday');
weekday[5] = I18n.t('friday');
weekday[6] = I18n.t('saturday');

class SendScreen extends Component {

    state = {
        address: null,
        amount: null,
        enterPin: false,
        showLoading: false,
        resultType: '',
        resultText: '',
    };

    componentDidMount() {

        Navigation.events().bindComponent(this);

        if (this.props.address!='') {
            this.setState({address: this.props.address, amount:this.props.amount});
        }
    }

    componentDidAppear() {
        this.refresh();
        if(Platform.OS==='android')
            this.backhandler=BackHandler.addEventListener('hardwareBackPress', () => {
                Navigation.mergeOptions(this.props.componentId, {
                    bottomTabs: {
                        currentTabIndex: 2
                    }
                })
                return true;
            });
    }

    componentDidDisappear() {
        if(this.backhandler)
            this.backhandler.remove()
    }
    refresh = () => {
        this.props.fetchAddressUtxo();
        this.props.fetchAddressInfo()
    };

    readQr = (componentId, result) => {
        Navigation.dismissModal(componentId);
        if (result) {
            this.setState({resultType: result.type, resultText:result.data});
        }
        else {
            this.setState({resultType: 'Result is empty'});
        }
        if (result && result.data!='') {

            let withOutPrefix = '';
            if (result.data.split('sin:').length == 2)
                    withOutPrefix = result.data.split('sin:')[1];
            else    withOutPrefix = result.data;
            
            let address;

            if (withOutPrefix.split('?').length > 1) {
                address = withOutPrefix.split('?')[0];
            } else {
                address = withOutPrefix;
            }

            let amount = parseParams(withOutPrefix).amount;

            this.setState({address, amount:amount?amount:this.state.amount});
        }
    };


    openQrScanner = () => {
        Navigation.showModal({
            component: {
                name: 'QrScannerScreen',
                passProps: {
                    onFinish: this.readQr,
                },
            },
        });
    };

    address = null;

    estimateFee = () => {

        if (parseFloat(this.state.amount)) {
            this.props.estimateFee(this.state.address, this.state.amount, (fee) => {
                if (fee) {
                    Navigation.showModal({
                        component: {
                            name: 'RequestPinCodeScreen',
                            passProps: {onFinish: (id) => this.sendTx(id, fee)},
                        },
                    });

                }
            });
        }
    };

    sendTx = (componentId, fee) => {
        Navigation.dismissModal(componentId)

        this.setState({showLoading: true});
        this.props.sendTransaction(this.state.address, this.state.amount, fee, false, (txid) => {
            this.setState({showLoading: false, address: null, amount: null});
            if (typeof this.props.address !== 'undefined' && this.props.address!='' && this.props.onPaymentSent) {
                this.props.onPaymentSent(this.props.componentId, txid);
            }
        });
    };

    setMaxAmount = () => {
        this.props.getMaxAmount((maxAmount)=>{
            if(maxAmount>0&&this.props.balance>0)
            this.setState({amount:normalRepresentation(maxAmount).toString()})

        })
    }


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAwareScrollView bounces={false} automaticallyAdjustContentInsets={false}>
                <Header title={I18n.t('send')} parentComponentId={this.props.componentId}/>
                <View style={styles.innerContainerWrapper}>
                    <View style={this.props.lightTheme?styles.innerContainerLight:styles.innerContainer}>
                        <View style={{alignItems:'center', marginTop: hp(-3)}}>
                            {this.props.lightTheme&&<SendMoneyLight width={wp(12)} height={wp(12)}/>}
                            {!this.props.lightTheme&&<SendMoney width={wp(12)} height={wp(12)}/>}
                        </View>

                        <View style={styles.textInputContainer}>
                            <Text style={this.props.lightTheme?styles.balanceTextLight:styles.balanceText}>{I18n.t('yourBalanceStr')}</Text>
                            <Text style={this.props.lightTheme?styles.balanceTextBigLight:styles.balanceTextBig}>{normalRepresentation(this.props.balance).toFixed(2)} {AppConfig.coinTicker}</Text>
                        
                            <View style={{width:wp(84), alignItems:'flex-start'}}>
                                <Text style={[this.props.lightTheme?styles.labelTextLight:styles.labelText]}>{I18n.t('to')}:</Text>
                                <TextInput editable style={this.props.lightTheme?styles.textInputLight2:styles.textInput2}
                                        onChangeText={(address) => {
                                            this.setState({address});
                                        }} value={this.state.address}
                                        placeholderTextColor={this.props.lightTheme?'black':'white'}/>
                                <TouchableOpacity onPress={this.openQrScanner} style={styles.iconWithinInput}>
                                {!this.props.lightTheme && <ScanQr width={wp(7)} height={wp(7)}/>}
                                {this.props.lightTheme && <ScanQrLight width={wp(7)} height={wp(7)}/>}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.textInputContainer}>
                            <Text style={this.props.lightTheme?styles.labelTextLight:styles.labelText}>{I18n.t('amount')}:</Text>
                            <TextInput editable  style={this.props.lightTheme?styles.textInputLight:styles.textInput}
                                       onChangeText={(amount) => {
                                           this.setState({amount});
                                       }} keyboardType={'decimal-pad'} value={this.state.amount}
                                       placeholderTextColor={this.props.lightTheme?'black':'white'}/>
                        </View>
                        
                        <View style={styles.dateContainer}>
                            <View>
                                <Text></Text>
                                <Text></Text>
                                <Text></Text>
                            </View>
                            <View style={{alignItems: 'flex-end'}}>
                                <Text style={this.props.lightTheme?styles.labelTextLight2:styles.labelText2}>{this.props.stats.usdPrice&&!isNaN(this.state.amount)?(this.props.stats.usdPrice*this.state.amount).toFixed(2):Number.parseFloat(0.0).toFixed(2)} USD</Text>
                                <Text style={this.props.lightTheme?styles.labelTextLight2:styles.labelText2}>{this.props.stats.lastPrice&&!isNaN(this.state.amount)?(this.props.stats.lastPrice*this.state.amount).toFixed(8):Number.parseFloat(0.0).toFixed(8)} BTC</Text>                              
                                <TouchableOpacity onPress={this.setMaxAmount} style={this.props.lightTheme?styles.maxButtonLight:styles.maxButton}>
                                    <Text style={this.props.lightTheme?styles.maxTextLight:styles.maxText}>{I18n.t('max')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.seperatorBottom,this.props.lightTheme?styles.borderLight:null}/>
                        <View style={styles.dateContainer}>
                            <View>
                                <Text style={this.props.lightTheme?styles.dateTextTitleLight:styles.dateTextTitle}>
                                    {weekday[new Date().getDay()].toUpperCase()}
                                </Text>
                                <Text style={this.props.lightTheme?styles.dateTextLight:styles.dateText}>
                                    {new Date().toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={{alignItems: 'flex-end'}}>
                                <Text style={this.props.lightTheme?styles.dateTextTitleLight:styles.dateTextTitle}>
                                    {I18n.t('time').toUpperCase()}
                                </Text>
                                <Text style={this.props.lightTheme?styles.dateTextLight:styles.dateText}>
                                    {new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}).replace(/(:\d{2})$/, "")}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Button label={I18n.t('send')} arrow onPress={this.estimateFee} style={styles.button}/>
                </View>
                {this.renderLoadingIndicator()}
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }

    renderQRDebugData = () => {
        var textResult = this.state.resultType!='' ? this.state.resultType+'#;#'+this.state.resultText+'#': '';
        
        if (textResult) {
            return (
                <Text style={this.props.lightTheme?styles.firstTextLight:styles.firstText}>{'Debug info:' + textResult}</Text>
            );
        }

        return null;
    };

    renderLoadingIndicator = () => {
        if (this.state.showLoading) {
            return (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator}/>
            );
        }

        return null;
    };
}

const mapStateToProps = (state) => {
    return {
        transactions: AccountSelectors.getTransactions(state),
        addresses: AccountSelectors.getAddresses(state),
        balance: AccountSelectors.getBalance(state),
        utxo: AccountSelectors.getUtxo(state),
        lightTheme: GlobalSelectors.getUseLightTheme(state),
        stats: NetworkSelectors.getStats(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sendTransaction: (destination, value, fee, noalerts, callback) => dispatch(AccountActions.sendTransaction(destination, value, fee, noalerts, callback)),
        estimateFee: (destination, value, callback) => dispatch(AccountActions.estimateFeeAndPromptUser(destination, value, callback)),
        getMaxAmount: (callback) => dispatch(AccountActions.getMaxAmount(callback)),
        fetchAddressUtxo: () => dispatch(AccountActions.fetchAddressUtxo()),
        fetchAddressInfo: ()=>dispatch(AccountActions.fetchAddressInfo()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SendScreen);
