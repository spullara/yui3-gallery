YUI.add("gallery-resource",function(G){var H,I="resource",K="uri",Q="headers",B="timeout",A="entityTranslators",T="request",D="response",E="success",J="failure",P="HEAD",R="OPTIONS",U="GET",F="POST",L="PUT",S="DELETE",N=G.Lang.isString,M=G.Lang.isObject,O=G.Lang.isNumber,C=G.Lang.isFunction;H=function(V){H.superclass.constructor.apply(this,arguments);};G.mix(H,{NAME:I,ATTRS:{uri:{validator:N},headers:{validator:M},timeout:{validator:O},entityTranslators:{validator:M}},ENTITY_TRANSLATORS:{JSON:{contentType:"application/json; charset=UTF-8",serialize:G.JSON.stringify,deserialize:G.JSON.parse},FORM:{contentType:"application/x-www-form-urlencoded; charset=UTF-8",serialize:G.QueryString.stringify,deserialize:null}},NO_ENTITY_METHODS:[U,P,S],isNoEntityMethod:function(V){return G.Array.indexOf(H.NO_ENTITY_METHODS,V.toUpperCase())>=0;}});G.extend(H,G.Base,{_request:null,initializer:function(V){if(!this.get(K)){G.error("A Resource needs to be configured with: uri");}V=V||{};this.publish(T,{defaultFn:this._defRequestFn});this.publish(D,{preventable:false});this.publish(E,{preventable:false});this.publish(J,{preventable:false});G.each(H.ENTITY_TRANSLATORS,G.bind(this.registerEntityTranslator,this));G.each(V[A],G.bind(this.registerEntityTranslator,this));},destructor:function(){this._request=null;},registerEntityTranslator:function(V){var W={};if(V&&V.contentType){W[V.contentType.split(";")[0]]=V;this.set(A,G.merge(this.get(A),W));}},unregisterEntityTranslator:function(W){var V=this.get(A);if(W){delete V[W.split(";")[0]];this.set(A,V);}},getEntityTranslator:function(V){return(V?this.get(A)[V.split(";")[0]]:null);},sendRequest:function(Y){var Z=this.get(K),X=this.get(Q),V=this.get(B),c,b,a,W;Y=Y||{};c=Y.method?Y.method.toUpperCase():U;b=G.merge(X,Y.headers);a=Y.timeout||V;if(H.isNoEntityMethod(c)){delete b["Content-Type"];}else{W=Y.entity;}this._request=null;this.fire(T,{uri:Z,headers:b,timeout:a,method:c,params:Y.params,entity:W,on:Y.on});return this._request;},HEAD:function(V){this.sendRequest(G.merge(V,{method:P}));},OPTIONS:function(V){this.sendRequest(G.merge(V,{method:R}));},GET:function(V){this.sendRequest(G.merge(V,{method:U}));},POST:function(V){this.sendRequest(G.merge(V,{method:F}));},PUT:function(V){this.sendRequest(G.merge(V,{method:L}));},DELETE:function(V){this.sendRequest(G.merge(V,{method:S}));},_defRequestFn:function(W){var V=W.method.toLowerCase()+"Request";this.publish(V,{defaultFn:this._sendRequest});this.fire(V,{uri:W.uri,headers:W.headers,timeout:W.timeout,method:W.method,params:W.params,entity:W.entity,on:W.on});},_sendRequest:function(c){var X=c.uri,V=c.method,W=c.headers,f=c.timeout,d=c.on,Z,a,b;if(M(c.params)){Z=G.clone(c.params,true);X=G.substitute(X,Z,function(g,e){delete Z[g];return e;});if(G.Object.size(Z)>0){X+=X.indexOf("?")<0?"?":"";X+=X[X.length-1]!=="?"&&X[X.length-1]!=="&"?"&":"";X+=G.QueryString.stringify(Z);}}a=c.entity;b=this.getEntityTranslator(W["Content-Type"]);if(a&&b&&b.serialize){try{a=b.serialize(a);}catch(Y){}}this._request=G.io(X,{method:V,headers:W,data:a,timeout:f,context:this,on:{complete:this._onComplete,success:this._onSuccess,failure:this._onFailure},"arguments":{request:{method:c.method,params:c.params,entity:c.entity},on:d}});},_onComplete:function(Z,Y,V){var X=V.request.method.toLowerCase()+"Response",W={txId:Z,request:V.request,response:Y};this.fire(D,W);this.fire(X,G.merge(W,{preventable:false}));if(V.on&&C(V.on.response)){V.on.response(W);}},_onSuccess:function(c,b,X){var a=X.request.method.toLowerCase()+"Success",V=b.responseText,W=this.getEntityTranslator(b.getResponseHeader("Content-Type")),Y;if(V&&W&&W.deserialize){try{V=W.deserialize(V);}catch(Z){}}Y={txId:c,request:X.request,response:b,entity:V};this.fire(E,Y);this.fire(a,G.merge(Y,{preventable:false}));if(X.on&&C(X.on.success)){X.on.success(Y);}},_onFailure:function(Z,Y,W){var V=W.request.method.toLowerCase()+"Failure",X={txId:Z,request:W.request,response:Y};this.fire(J,X);this.fire(V,G.merge(X,{preventable:false}));if(W.on&&C(W.on.failure)){W.on.failure(X);}}});G.Resource=H;},"@VERSION@",{requires:["base-base","io-base","json","substitute"]});